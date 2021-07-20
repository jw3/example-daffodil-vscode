import * as vscode from "vscode";
import { Dict, DisplayHtmlRequest } from "./types";
import * as fs from "fs";
import * as hexy from "hexy";

export class DebuggerHtmlView {
    panels: Dict<vscode.WebviewPanel> = {};

    constructor(context: vscode.ExtensionContext) {
        let subscriptions = context.subscriptions;
        subscriptions.push(vscode.debug.onDidTerminateDebugSession(this.onTerminatedDebugSession, this));
        subscriptions.push(vscode.debug.onDidReceiveDebugSessionCustomEvent(this.onDebugSessionCustomEvent, this));
    }

    onTerminatedDebugSession(session: vscode.DebugSession) {
        if (session.type == 'dfdl') {
            delete this.panels[session.id];
        }
    }

    onDebugSessionCustomEvent(e: vscode.DebugSessionCustomEvent) {
        if (e.session.type == 'dfdl') {
            if (e.event == 'daffodil.data') {
                this.onDisplayHtml(e.session, e.body);
            }
        }
    }

    onDisplayHtml(session: vscode.DebugSession, body: DisplayHtmlRequest) {
        let file = fs.readFileSync("/Users/sdell/workspaces/daffodil/example-daffodil-vscode/sampleWorkspace/works.jpg");
        let hex = hexy.hexy(file);
        let hexArray = hex.split("\n");

        let panel = this.panels[session.name];
        if (!panel) {
            panel = vscode.window.createWebviewPanel('dfdl', "Data Info", vscode.ViewColumn.Active, {
                enableScripts: true
            });
            panel.onDidDispose(() => delete this.panels[session.name]);
            this.panels[session.name] = panel;
        }
        else {
            panel.title = "Data Info";
        }

        if (!panel.webview.html.includes(hexArray[body.bytePos1b-1])) {
            panel.webview.html += "<h3 style=\"font-size: 14px;\">" + hexArray[body.bytePos1b-1] + "</h3>"
        }
        panel.reveal();
    }
}
