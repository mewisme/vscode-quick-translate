import * as vscode from 'vscode';

import type { RenderContext, TranslationRenderer } from '../types/renderer-types';

interface InsertedBlockState {
  editor: vscode.TextEditor;
  range: vscode.Range;
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

  constructor() {
    this.subscriptions = [
      vscode.window.onDidChangeTextEditorSelection(e => {
        if (this.inserted && e.textEditor === this.inserted.editor) {
          this.clear();
        }
      }),
      vscode.workspace.onDidChangeTextDocument(e => {
        if (this.isOwnEdit) { return; }
        if (this.inserted && e.document === this.inserted.editor.document) {
          this.clear();
        }
      }),
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (this.inserted && editor !== this.inserted.editor) {
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

  async render(context: RenderContext): Promise<void> {
    const { translatedText, selectionRange, editor } = context;

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

    const separator = indent + '\n--- translation ---';

    const blockLines = translatedText.map(line =>
      indent + line.replace(/\r$/, '')
    );

    const blockContent = [separator, ...blockLines, '\n'].join('\n');

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
    };

    void editor.setDecorations(this.blockDecoration, [this.inserted.range]);
    queueMicrotask(() => { this.isOwnEdit = false; });
  }

  private async removeInsertedBlock(): Promise<void> {
    if (!this.inserted) { return; }

    const { editor, range } = this.inserted;
    this.inserted = undefined;

    const newRange = new vscode.Range(range.start, new vscode.Position(range.end.line + 1, 0));

    try {
      await editor.edit(
        editBuilder => {
          editBuilder.delete(newRange);
        },
        { undoStopBefore: false, undoStopAfter: true }
      );
      void editor.setDecorations(this.blockDecoration, []);
      void editor.document.save();
    } catch {
      // ignore if document changed
    }
  }

  clear(): void {
    void this.removeInsertedBlock();
  }

  dispose(): void {
    this.clear();
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
    this.blockDecoration.dispose();
  }
}