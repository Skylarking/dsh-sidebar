import { randomUUID } from "node:crypto";
import { realpath } from "node:fs/promises";
import z from "@deepseek-ai/schemastery";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { WorkspaceId } from "@deepseek-ai/dsh-workspace";
import { spawn } from "node-pty";
//#region lib/types/types.js
/** Client-safe workspace console payloads. */
/**
* Create a typed workspace-console session id from its wire value.
* @param value - opaque id received from or issued across the Remote boundary.
* @returns branded session identity.
*/
function WorkspaceConsoleSessionId(value) {
	return value;
}
//#endregion
//#region lib/types/index.js
/** Persistent PTY Remote for registered workspace directories. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
var OutputTail = class {
	maxBytes;
	chunks = [];
	retainedBytes = 0;
	total = 0;
	constructor(maxBytes) {
		this.maxBytes = maxBytes;
	}
	append(text) {
		this.appendText(text);
	}
	read(fromByte) {
		if (!Number.isSafeInteger(fromByte) || fromByte < 0 || fromByte > this.total) throw new Error("terminal output offset must be a non-negative prior offset");
		const retained = Buffer.concat(this.chunks, this.retainedBytes);
		const windowStart = this.total - retained.byteLength;
		const lossy = fromByte < windowStart;
		const start = lossy ? 0 : fromByte - windowStart;
		return {
			text: retained.subarray(start).toString("utf8"),
			nextOffset: this.total,
			lossy
		};
	}
	appendText(text) {
		if (text === "") return;
		const chunk = Buffer.from(text, "utf8");
		this.chunks.push(chunk);
		this.retainedBytes += chunk.byteLength;
		this.total += chunk.byteLength;
		while (this.retainedBytes > this.maxBytes) {
			const first = this.chunks[0];
			if (first === void 0) throw new Error("workspace console output tail lost its retained chunk");
			const excess = this.retainedBytes - this.maxBytes;
			if (first.byteLength <= excess) {
				this.chunks.shift();
				this.retainedBytes -= first.byteLength;
			} else {
				let start = excess;
				while (start < first.byteLength && ((first[start] ?? 0) & 192) === 128) start += 1;
				this.chunks[0] = first.subarray(start);
				this.retainedBytes -= start;
			}
		}
	}
};
/** Remote-only service owning persistent human workspace terminals. */
let WorkspaceConsoleGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _open_decorators;
	let _write_decorators;
	let _read_decorators;
	let _resize_decorators;
	let _close_decorators;
	return class WorkspaceConsoleGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_open_decorators = [Remote("open")];
			_write_decorators = [Remote("write")];
			_read_decorators = [Remote("read")];
			_resize_decorators = [Remote("resize")];
			_close_decorators = [Remote("close")];
			__esDecorate(this, null, _open_decorators, {
				kind: "method",
				name: "open",
				static: false,
				private: false,
				access: {
					has: (obj) => "open" in obj,
					get: (obj) => obj.open
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _write_decorators, {
				kind: "method",
				name: "write",
				static: false,
				private: false,
				access: {
					has: (obj) => "write" in obj,
					get: (obj) => obj.write
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _read_decorators, {
				kind: "method",
				name: "read",
				static: false,
				private: false,
				access: {
					has: (obj) => "read" in obj,
					get: (obj) => obj.read
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _resize_decorators, {
				kind: "method",
				name: "resize",
				static: false,
				private: false,
				access: {
					has: (obj) => "resize" in obj,
					get: (obj) => obj.resize
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _close_decorators, {
				kind: "method",
				name: "close",
				static: false,
				private: false,
				access: {
					has: (obj) => "close" in obj,
					get: (obj) => obj.close
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		config = __runInitializers(this, _instanceExtraInitializers);
		static inject = ["workspaceRegistry"];
		static Config = z.object({
			shell: z.string().default("/bin/zsh"),
			shellArgs: z.array(z.string()).default(["-l"]),
			graceMs: z.natural().min(100).default(2e3),
			maxOutputBytes: z.natural().min(1024).default(256 * 1024),
			maxInputChars: z.natural().min(1).default(64 * 1024),
			maxSessions: z.natural().min(1).default(8)
		});
		sessions = /* @__PURE__ */ new Map();
		pendingOpens = /* @__PURE__ */ new Set();
		disposing = false;
		constructor(ctx, config) {
			super(ctx, "workspaceConsole");
			this.config = config;
			ctx.effect(() => () => this.disposeAll(), "workspace-console PTY teardown");
		}
		/**
		* Allocate one persistent terminal rooted at a registered workspace.
		* @param workspaceId - Registered workspace id.
		* @param cols - Initial terminal columns.
		* @param rows - Initial terminal rows.
		* @returns the allocated terminal identity.
		*/
		async open(workspaceId, cols, rows) {
			this.assertActive();
			this.assertDimensions(cols, rows);
			if (this.sessions.size + this.pendingOpens.size >= this.config.maxSessions) throw new Error("workspace console session limit reached");
			const workspace = this.ctx.workspaceRegistry.get(WorkspaceId(workspaceId));
			if (workspace === void 0) throw new Error(`unknown workspace '${workspaceId}'`);
			const allocation = this.allocate(workspace.path, cols, rows);
			const pending = { settled: allocation.then(() => {}, () => {}) };
			this.pendingOpens.add(pending);
			try {
				return await allocation;
			} finally {
				this.pendingOpens.delete(pending);
			}
		}
		async allocate(path, cols, rows) {
			const cwd = await realpath(path);
			this.assertActive();
			const handle = spawn(this.config.shell, this.config.shellArgs, {
				cwd,
				cols,
				rows,
				name: "xterm-256color",
				env: Object.fromEntries(Object.entries(process.env).filter((entry) => entry[1] !== void 0))
			});
			const sessionId = WorkspaceConsoleSessionId(`workspace-console-${randomUUID()}`);
			const output = new OutputTail(this.config.maxOutputBytes);
			const exit = Promise.withResolvers();
			const record = {
				handle,
				output,
				dataSubscription: handle.onData((data) => output.append(data)),
				exited: exit.promise,
				outcome: void 0
			};
			record.exitSubscription = handle.onExit(({ exitCode, signal }) => {
				record.outcome = {
					exitCode,
					signal: signal === void 0 ? null : String(signal)
				};
				exit.resolve();
			});
			this.sessions.set(sessionId, record);
			return { sessionId };
		}
		/**
		* Write raw keyboard data into a terminal.
		* @param sessionId - terminal identity returned by {@link open}.
		* @param data - raw xterm input without newline conversion.
		*/
		async write(sessionId, data) {
			if (data.length === 0 || data.length > this.config.maxInputChars || data.includes("\0")) throw new Error(`terminal input must contain 1-${this.config.maxInputChars} characters without NUL`);
			this.session(sessionId).handle.write(data);
		}
		/**
		* Read terminal output after a caller-owned byte offset.
		* @param sessionId - terminal identity returned by {@link open}.
		* @param fromByte - byte offset returned by the previous read.
		* @returns incremental terminal output and current exit state.
		*/
		read(sessionId, fromByte) {
			const record = this.session(sessionId);
			return {
				...record.output.read(fromByte),
				exited: record.outcome !== void 0,
				exitCode: record.outcome?.exitCode ?? null,
				signal: record.outcome?.signal ?? null
			};
		}
		/**
		* Resize a live terminal.
		* @param sessionId - terminal identity returned by {@link open}.
		* @param cols - terminal columns.
		* @param rows - terminal rows.
		*/
		async resize(sessionId, cols, rows) {
			this.assertDimensions(cols, rows);
			this.session(sessionId).handle.resize(cols, rows);
		}
		/**
		* Close one terminal. Repeating a close is a no-op.
		* @param sessionId - terminal identity returned by {@link open}.
		*/
		async close(sessionId) {
			const record = this.sessions.get(sessionId);
			if (record === void 0) return;
			this.sessions.delete(sessionId);
			await this.terminate(record);
		}
		session(sessionId) {
			const record = this.sessions.get(sessionId);
			if (record === void 0) throw new Error(`unknown workspace console session '${sessionId}'`);
			return record;
		}
		assertActive() {
			if (this.disposing) throw new Error("workspace console is disposing");
		}
		assertDimensions(cols, rows) {
			if (!Number.isInteger(cols) || cols < 1 || cols > 1e3) throw new Error("terminal columns must be an integer between 1 and 1000");
			if (!Number.isInteger(rows) || rows < 1 || rows > 500) throw new Error("terminal rows must be an integer between 1 and 500");
		}
		async disposeAll() {
			this.disposing = true;
			const pending = [...this.pendingOpens];
			await Promise.all(pending.map((open) => open.settled));
			const records = [...this.sessions.values()];
			this.sessions.clear();
			await Promise.all(records.map(async (record) => await this.terminate(record)));
		}
		async terminate(record) {
			if (record.outcome === void 0) {
				record.handle.kill("SIGTERM");
				if (!await Promise.race([record.exited.then(() => true), new Promise((resolvePromise) => setTimeout(() => resolvePromise(false), this.config.graceMs))]) && record.outcome === void 0) {
					record.handle.kill("SIGKILL");
					await record.exited;
				}
			}
			record.dataSubscription.dispose();
			record.exitSubscription?.dispose();
		}
	};
})();
//#endregion
export { WorkspaceConsoleGateway, WorkspaceConsoleGateway as default };
