import * as vscode from 'vscode';

import type { RenderContext, TranslationRenderer } from '../types/renderer-types';

import { getQuickTranslateConfig } from '../config/get-config';
import { getCommentSyntax } from '../utils/comment-syntax';

const DISMISS_GRACE_MS = 100;

interface InsertedBlockState {
  editor: vscode.TextEditor;
  range: vscode.Range;
  sourceRange: vscode.Range;
  translatedLines: string[];
}

function getLeadingWhitespace(line: vscode.TextLine): string {
  const match = line.text.match(/^\s*/);
  return match ? match[0] : '';
}

export class InlineRenderer implements TranslationRenderer {
  private inserted: InsertedBlockState | undefined;
  private subscriptions: vscode.Disposable[] = [];
  private blockDecoration: vscode.TextEditorDecorationType;
  private isOwnEdit = false;
  private dismissTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.subscriptions = [
      vscode.window.onDidChangeTextEditorSelection(e => {
        if (this.inserted && e.textEditor === this.inserted.editor) {
          this.scheduleDismiss();
        }
      }),
      vscode.workspace.onDidChangeTextDocument(e => {
        if (this.isOwnEdit) { return; }
        if (this.inserted && e.document === this.inserted.editor.document) {
          this.cancelDismiss();
          this.clear();
        }
      }),
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (this.inserted && editor !== this.inserted.editor) {
          this.cancelDismiss();
          this.clear();
        }
      }),
    ];

    this.blockDecoration = vscode.window.createTextEditorDecorationType({
      color: new vscode.ThemeColor('editorCodeLens.foreground'),
      fontStyle: 'italic',
      isWholeLine: true,
    });
  }

  private scheduleDismiss(): void {
    this.cancelDismiss();
    this.dismissTimer = setTimeout(() => {
      this.dismissTimer = undefined;
      void this.removeInsertedBlock();
    }, DISMISS_GRACE_MS);
  }

  private cancelDismiss(): void {
    if (this.dismissTimer !== undefined) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = undefined;
    }
  }

  async render(context: RenderContext): Promise<void> {
    const { translatedText, selectionRange, editor } = context;

    this.cancelDismiss();

    if (!translatedText.length) {
      this.clear();
      return;
    }

    await this.removeInsertedBlock();

    const doc = editor.document;

    const firstLine = Math.min(selectionRange.start.line, selectionRange.end.line);
    const lastLine = Math.max(selectionRange.start.line, selectionRange.end.line);

    const insertLine = lastLine + 1;
    const indent = getLeadingWhitespace(doc.lineAt(firstLine));

    const syntax = getCommentSyntax(doc.languageId);
    const cleanLines = translatedText.map(line => line.replace(/\r$/, ''));

    let blockContent: string;
    if (syntax?.type === 'block') {
      blockContent = [
        indent + syntax.start + ' translation',
        ...cleanLines.map(line => indent + line),
        indent + syntax.end,
        '\n',
      ].join('\n');
    } else if (syntax?.type === 'line') {
      blockContent = [
        indent + syntax.prefix + ' translation',
        ...cleanLines.map(line => indent + syntax.prefix + ' ' + line),
        '\n',
      ].join('\n');
    } else {
      blockContent = [
        indent + '--- translation ---',
        ...cleanLines.map(line => indent + line),
        '\n',
      ].join('\n');
    }

    const safeInsertLine =
      insertLine >= doc.lineCount ? doc.lineCount : insertLine;

    const insertPosition = new vscode.Position(safeInsertLine, 0);

    this.isOwnEdit = true;
    const applied = await editor.edit(
      editBuilder => {
        editBuilder.insert(insertPosition, blockContent);
      },
      { undoStopBefore: false, undoStopAfter: true }
    );

    if (!applied) {
      this.isOwnEdit = false;
      return;
    }

    const insertedLineCount = blockContent.split('\n').length;
    const endLine = insertPosition.line + insertedLineCount - 2;
    const endPosition = new vscode.Position(endLine, 0);

    this.inserted = {
      editor,
      range: new vscode.Range(insertPosition, endPosition),
      sourceRange: selectionRange,
      translatedLines: translatedText,
    };

    void editor.setDecorations(this.blockDecoration, [this.inserted.range]);
    queueMicrotask(() => { this.isOwnEdit = false; });
  }

  async accept(): Promise<void> {
    if (!this.inserted) { return; }

    const { editor, range: blockRange, sourceRange, translatedLines } = this.inserted;
    const doc = editor.document;

    this.cancelDismiss();
    this.inserted = undefined;
    void editor.setDecorations(this.blockDecoration, []);

    const replacementText = translatedLines.join('\n');

    // Compute the line delta introduced by replacing the source text,
    // then adjust the block range coordinates accordingly.
    const sourceLineCount =
      sourceRange.end.line - sourceRange.start.line + 1;
    const replacementLineCount = translatedLines.length;
    const lineDelta = replacementLineCount - sourceLineCount;

    const adjustedBlockStart = new vscode.Position(
      blockRange.start.line + lineDelta,
      blockRange.start.character
    );
    const adjustedBlockEnd = new vscode.Position(
      blockRange.end.line + lineDelta,
      blockRange.end.character
    );
    const adjustedBlockRange = new vscode.Range(adjustedBlockStart, adjustedBlockEnd);
    const blockDeleteRange = new vscode.Range(
      adjustedBlockStart,
      new vscode.Position(adjustedBlockEnd.line + 1, 0)
    );

    const wsEdit = new vscode.WorkspaceEdit();
    wsEdit.replace(doc.uri, sourceRange, replacementText);
    wsEdit.delete(doc.uri, blockDeleteRange);

    this.isOwnEdit = true;
    await vscode.workspace.applyEdit(wsEdit);
    queueMicrotask(() => { this.isOwnEdit = false; });

    if (getQuickTranslateConfig().inlineSave) {
      void doc.save();
    }
  }

  private async removeInsertedBlock(): Promise<void> {
    if (!this.inserted) { return; }

    const { editor, range } = this.inserted;
    this.inserted = undefined;
    void editor.setDecorations(this.blockDecoration, []);

    try {
      if (editor === vscode.window.activeTextEditor) {
        // Undo the insertion — restores the document to its exact pre-translation
        // state (including clean/dirty status) without creating a new edit entry.
        this.isOwnEdit = true;
        await vscode.commands.executeCommand('undo');
        queueMicrotask(() => { this.isOwnEdit = false; });
      } else {
        // Editor is no longer focused; fall back to a direct delete so undo
        // is not triggered on whichever editor is currently active.
        const deleteRange = new vscode.Range(
          range.start,
          new vscode.Position(range.end.line + 1, 0)
        );
        await editor.edit(
          editBuilder => { editBuilder.delete(deleteRange); },
          { undoStopBefore: false, undoStopAfter: false }
        );
      }
    } catch {
      // ignore if document changed
    }
  }

  clear(): void {
    this.cancelDismiss();
    void this.removeInsertedBlock();
  }

  dispose(): void {
    this.cancelDismiss();
    void this.removeInsertedBlock();
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
    this.blockDecoration.dispose();
  }
}
