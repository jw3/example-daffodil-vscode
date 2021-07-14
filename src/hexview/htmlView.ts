import {
    window, debug, DebugSession, DebugSessionCustomEvent, ExtensionContext, WebviewPanel, ViewColumn
} from "vscode";
import { Dict } from './commonTypes';
import { DisplayHtmlRequest } from "./adapterMessages";

export class DebuggerHtmlView {
    panels: Dict<WebviewPanel> = {};

    constructor(context: ExtensionContext) {
        let subscriptions = context.subscriptions;
        subscriptions.push(debug.onDidTerminateDebugSession(this.onTerminatedDebugSession, this));
        subscriptions.push(debug.onDidReceiveDebugSessionCustomEvent(this.onDebugSessionCustomEvent, this));
    }

    onTerminatedDebugSession(session: DebugSession) {
        if (session.type == 'dfdl') {
            delete this.panels[session.id];
        }
    }

    onDebugSessionCustomEvent(e: DebugSessionCustomEvent) {
        window.showInformationMessage("onDebugSessionCustomEvent");
        if (e.session.type == 'dfdl') {
            if (e.event == 'displayHtml') {
                this.onDisplayHtml(e.session, e.body);
            }
        }
    }

    onDisplayHtml(session: DebugSession, body: DisplayHtmlRequest) {
        if (!body.html)
            return;
        let title = body.title || session.name;
        let panel = this.panels[session.name];
        if (!panel) {
            let position = body.position !== null ? body.position : ViewColumn.Active;
            panel = window.createWebviewPanel('dfdl', title, position, {
                enableScripts: true
            });
            panel.onDidDispose(() => delete this.panels[session.name]);
            this.panels[session.name] = panel;
        } else {
            panel.title = title;
        }
        panel.webview.html = body.html;
        if (body.reveal) {
            panel.reveal();
        }
    }
}
