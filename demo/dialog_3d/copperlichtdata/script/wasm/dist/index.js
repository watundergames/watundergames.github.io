(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.wasmoon = {}));
})(this, (function (exports) { 'use strict';

    exports.LuaReturn = void 0;
    (function (LuaReturn) {
        LuaReturn[LuaReturn["Ok"] = 0] = "Ok";
        LuaReturn[LuaReturn["Yield"] = 1] = "Yield";
        LuaReturn[LuaReturn["ErrorRun"] = 2] = "ErrorRun";
        LuaReturn[LuaReturn["ErrorSyntax"] = 3] = "ErrorSyntax";
        LuaReturn[LuaReturn["ErrorMem"] = 4] = "ErrorMem";
        LuaReturn[LuaReturn["ErrorErr"] = 5] = "ErrorErr";
        LuaReturn[LuaReturn["ErrorFile"] = 6] = "ErrorFile";
    })(exports.LuaReturn || (exports.LuaReturn = {}));
    const PointerSize = 4;
    const LUA_MULTRET = -1;
    const LUAI_MAXSTACK = 1000000;
    const LUA_REGISTRYINDEX = -LUAI_MAXSTACK - 1000;
    exports.LuaType = void 0;
    (function (LuaType) {
        LuaType[LuaType["None"] = -1] = "None";
        LuaType[LuaType["Nil"] = 0] = "Nil";
        LuaType[LuaType["Boolean"] = 1] = "Boolean";
        LuaType[LuaType["LightUserdata"] = 2] = "LightUserdata";
        LuaType[LuaType["Number"] = 3] = "Number";
        LuaType[LuaType["String"] = 4] = "String";
        LuaType[LuaType["Table"] = 5] = "Table";
        LuaType[LuaType["Function"] = 6] = "Function";
        LuaType[LuaType["Userdata"] = 7] = "Userdata";
        LuaType[LuaType["Thread"] = 8] = "Thread";
    })(exports.LuaType || (exports.LuaType = {}));
    exports.LuaEventCodes = void 0;
    (function (LuaEventCodes) {
        LuaEventCodes[LuaEventCodes["Call"] = 0] = "Call";
        LuaEventCodes[LuaEventCodes["Ret"] = 1] = "Ret";
        LuaEventCodes[LuaEventCodes["Line"] = 2] = "Line";
        LuaEventCodes[LuaEventCodes["Count"] = 3] = "Count";
        LuaEventCodes[LuaEventCodes["TailCall"] = 4] = "TailCall";
    })(exports.LuaEventCodes || (exports.LuaEventCodes = {}));
    exports.LuaEventMasks = void 0;
    (function (LuaEventMasks) {
        LuaEventMasks[LuaEventMasks["Call"] = 1] = "Call";
        LuaEventMasks[LuaEventMasks["Ret"] = 2] = "Ret";
        LuaEventMasks[LuaEventMasks["Line"] = 4] = "Line";
        LuaEventMasks[LuaEventMasks["Count"] = 8] = "Count";
    })(exports.LuaEventMasks || (exports.LuaEventMasks = {}));
    exports.LuaLibraries = void 0;
    (function (LuaLibraries) {
        LuaLibraries["Base"] = "_G";
        LuaLibraries["Coroutine"] = "coroutine";
        LuaLibraries["Table"] = "table";
        LuaLibraries["IO"] = "io";
        LuaLibraries["OS"] = "os";
        LuaLibraries["String"] = "string";
        LuaLibraries["UTF8"] = "utf8";
        LuaLibraries["Math"] = "math";
        LuaLibraries["Debug"] = "debug";
        LuaLibraries["Package"] = "package";
    })(exports.LuaLibraries || (exports.LuaLibraries = {}));
    class LuaTimeoutError extends Error {
    }

    class Decoration {
        constructor(target, options) {
            this.target = target;
            this.options = options;
        }
    }
    function decorate(target, options) {
        return new Decoration(target, options);
    }

    class Pointer extends Number {
    }

    class MultiReturn extends Array {
    }

    const INSTRUCTION_HOOK_COUNT = 1000;
    class Thread {
        constructor(lua, typeExtensions, address, parent) {
            this.closed = false;
            this.lua = lua;
            this.typeExtensions = typeExtensions;
            this.address = address;
            this.parent = parent;
        }
        newThread() {
            const address = this.lua.lua_newthread(this.address);
            if (!address) {
                throw new Error('lua_newthread returned a null pointer');
            }
            return new Thread(this.lua, this.typeExtensions, address);
        }
        resetThread() {
            this.assertOk(this.lua.lua_resetthread(this.address));
        }
        loadString(luaCode, name) {
            const size = this.lua.module.lengthBytesUTF8(luaCode);
            const pointerSize = size + 1;
            const bufferPointer = this.lua.module._malloc(pointerSize);
            try {
                this.lua.module.stringToUTF8(luaCode, bufferPointer, pointerSize);
                this.assertOk(this.lua.luaL_loadbufferx(this.address, bufferPointer, size, name !== null && name !== void 0 ? name : bufferPointer, null));
            }
            finally {
                this.lua.module._free(bufferPointer);
            }
        }
        loadFile(filename) {
            this.assertOk(this.lua.luaL_loadfilex(this.address, filename, null));
        }
        resume(argCount = 0) {
            const dataPointer = this.lua.module._malloc(PointerSize);
            try {
                this.lua.module.setValue(dataPointer, 0, 'i32');
                const luaResult = this.lua.lua_resume(this.address, null, argCount, dataPointer);
                return {
                    result: luaResult,
                    resultCount: this.lua.module.getValue(dataPointer, 'i32'),
                };
            }
            finally {
                this.lua.module._free(dataPointer);
            }
        }
        getTop() {
            return this.lua.lua_gettop(this.address);
        }
        setTop(index) {
            this.lua.lua_settop(this.address, index);
        }
        remove(index) {
            return this.lua.lua_remove(this.address, index);
        }
        setField(index, name, value) {
            index = this.lua.lua_absindex(this.address, index);
            this.pushValue(value);
            this.lua.lua_setfield(this.address, index, name);
        }
        async run(argCount = 0, options) {
            const originalTimeout = this.timeout;
            try {
                if ((options === null || options === void 0 ? void 0 : options.timeout) !== undefined) {
                    this.setTimeout(Date.now() + options.timeout);
                }
                let resumeResult = this.resume(argCount);
                while (resumeResult.result === exports.LuaReturn.Yield) {
                    if (this.timeout && Date.now() > this.timeout) {
                        if (resumeResult.resultCount > 0) {
                            this.pop(resumeResult.resultCount);
                        }
                        throw new LuaTimeoutError(`thread timeout exceeded`);
                    }
                    if (resumeResult.resultCount > 0) {
                        const lastValue = this.getValue(-1);
                        this.pop(resumeResult.resultCount);
                        if (lastValue === Promise.resolve(lastValue)) {
                            await lastValue;
                        }
                        else {
                            await new Promise((resolve) => setImmediate(resolve));
                        }
                    }
                    else {
                        await new Promise((resolve) => setImmediate(resolve));
                    }
                    resumeResult = this.resume(0);
                }
                this.assertOk(resumeResult.result);
                return this.getStackValues();
            }
            finally {
                if ((options === null || options === void 0 ? void 0 : options.timeout) !== undefined) {
                    this.setTimeout(originalTimeout);
                }
            }
        }
        runSync(argCount = 0) {
            const base = this.getTop() - argCount - 1;
            this.assertOk(this.lua.lua_pcallk(this.address, argCount, LUA_MULTRET, 0, 0, null));
            return this.getStackValues(base);
        }
        pop(count = 1) {
            this.lua.lua_pop(this.address, count);
        }
        call(name, ...args) {
            const type = this.lua.lua_getglobal(this.address, name);
            if (type !== exports.LuaType.Function) {
                throw new Error(`A function of type '${type}' was pushed, expected is ${exports.LuaType.Function}`);
            }
            for (const arg of args) {
                this.pushValue(arg);
            }
            const base = this.getTop() - args.length - 1;
            this.lua.lua_callk(this.address, args.length, LUA_MULTRET, 0, null);
            return this.getStackValues(base);
        }
        getStackValues(start = 0) {
            const returns = this.getTop() - start;
            const returnValues = new MultiReturn(returns);
            for (let i = 0; i < returns; i++) {
                returnValues[i] = this.getValue(start + i + 1);
            }
            return returnValues;
        }
        stateToThread(L) {
            var _a;
            return L === ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.address) ? this.parent : new Thread(this.lua, this.typeExtensions, L, this.parent || this);
        }
        pushValue(rawValue, userdata) {
            var _a;
            const decoratedValue = this.getValueDecorations(rawValue);
            const target = (_a = decoratedValue.target) !== null && _a !== void 0 ? _a : undefined;
            if (target instanceof Thread) {
                const isMain = this.lua.lua_pushthread(target.address) === 1;
                if (!isMain) {
                    this.lua.lua_xmove(target.address, this.address, 1);
                }
                return;
            }
            const startTop = this.getTop();
            switch (typeof target) {
                case 'undefined':
                    this.lua.lua_pushnil(this.address);
                    break;
                case 'number':
                    if (Number.isInteger(target)) {
                        this.lua.lua_pushinteger(this.address, target);
                    }
                    else {
                        this.lua.lua_pushnumber(this.address, target);
                    }
                    break;
                case 'string':
                    this.lua.lua_pushstring(this.address, target);
                    break;
                case 'boolean':
                    this.lua.lua_pushboolean(this.address, target ? 1 : 0);
                    break;
                default:
                    if (!this.typeExtensions.find((wrapper) => wrapper.extension.pushValue(this, decoratedValue, userdata))) {
                        throw new Error(`The type '${typeof target}' is not supported by Lua`);
                    }
            }
            if (decoratedValue.options.metatable) {
                this.setMetatable(-1, decoratedValue.options.metatable);
            }
            if (this.getTop() !== startTop + 1) {
                throw new Error(`pushValue expected stack size ${startTop + 1}, got ${this.getTop()}`);
            }
        }
        setMetatable(index, metatable) {
            index = this.lua.lua_absindex(this.address, index);
            if (this.lua.lua_getmetatable(this.address, index)) {
                this.pop(1);
                const name = this.getMetatableName(index);
                throw new Error(`data already has associated metatable: ${name || 'unknown name'}`);
            }
            this.pushValue(metatable);
            this.lua.lua_setmetatable(this.address, index);
        }
        getMetatableName(index) {
            const metatableNameType = this.lua.luaL_getmetafield(this.address, index, '__name');
            if (metatableNameType === exports.LuaType.Nil) {
                return undefined;
            }
            if (metatableNameType !== exports.LuaType.String) {
                this.pop(1);
                return undefined;
            }
            const name = this.lua.lua_tolstring(this.address, -1, null);
            this.pop(1);
            return name;
        }
        getValue(index, inputType, userdata) {
            index = this.lua.lua_absindex(this.address, index);
            const type = inputType !== null && inputType !== void 0 ? inputType : this.lua.lua_type(this.address, index);
            switch (type) {
                case exports.LuaType.None:
                    return undefined;
                case exports.LuaType.Nil:
                    return null;
                case exports.LuaType.Number:
                    return this.lua.lua_tonumberx(this.address, index, null);
                case exports.LuaType.String:
                    return this.lua.lua_tolstring(this.address, index, null);
                case exports.LuaType.Boolean:
                    return Boolean(this.lua.lua_toboolean(this.address, index));
                case exports.LuaType.Thread:
                    return this.stateToThread(this.lua.lua_tothread(this.address, index));
                default: {
                    let metatableName;
                    if (type === exports.LuaType.Table || type === exports.LuaType.Userdata) {
                        metatableName = this.getMetatableName(index);
                    }
                    const typeExtensionWrapper = this.typeExtensions.find((wrapper) => wrapper.extension.isType(this, index, type, metatableName));
                    if (typeExtensionWrapper) {
                        return typeExtensionWrapper.extension.getValue(this, index, userdata);
                    }
                    console.warn(`The type '${this.lua.lua_typename(this.address, type)}' returned is not supported on JS`);
                    return new Pointer(this.lua.lua_topointer(this.address, index));
                }
            }
        }
        close() {
            if (this.isClosed()) {
                return;
            }
            if (this.hookFunctionPointer) {
                this.lua.module.removeFunction(this.hookFunctionPointer);
            }
            this.closed = true;
        }
        setTimeout(timeout) {
            if (timeout && timeout > 0) {
                if (!this.hookFunctionPointer) {
                    this.hookFunctionPointer = this.lua.module.addFunction(() => {
                        if (Date.now() > timeout) {
                            this.pushValue(new LuaTimeoutError(`thread timeout exceeded`));
                            this.lua.lua_error(this.address);
                        }
                    }, 'vii');
                }
                this.lua.lua_sethook(this.address, this.hookFunctionPointer, exports.LuaEventMasks.Count, INSTRUCTION_HOOK_COUNT);
                this.timeout = timeout;
            }
            else if (this.hookFunctionPointer) {
                this.hookFunctionPointer = undefined;
                this.timeout = undefined;
                this.lua.lua_sethook(this.address, null, 0, 0);
            }
        }
        getTimeout() {
            return this.timeout;
        }
        getPointer(index) {
            return new Pointer(this.lua.lua_topointer(this.address, index));
        }
        isClosed() {
            var _a;
            return !this.address || this.closed || Boolean((_a = this.parent) === null || _a === void 0 ? void 0 : _a.isClosed());
        }
        indexToString(index) {
            const str = this.lua.luaL_tolstring(this.address, index, null);
            this.pop();
            return str;
        }
        dumpStack(log = console.log) {
            const top = this.getTop();
            for (let i = 1; i <= top; i++) {
                const type = this.lua.lua_type(this.address, i);
                const typename = this.lua.lua_typename(this.address, type);
                const pointer = this.getPointer(i);
                const name = this.indexToString(i);
                const value = this.getValue(i, type);
                log(i, typename, pointer, name, value);
            }
        }
        assertOk(result) {
            if (result !== exports.LuaReturn.Ok && result !== exports.LuaReturn.Yield) {
                const resultString = exports.LuaReturn[result];
                const error = new Error(`Lua Error(${resultString}/${result})`);
                if (this.getTop() > 0) {
                    if (result === exports.LuaReturn.ErrorMem) {
                        error.message = this.lua.lua_tolstring(this.address, -1, null);
                    }
                    else {
                        const luaError = this.getValue(-1);
                        if (luaError instanceof Error) {
                            error.stack = luaError.stack;
                        }
                        error.message = this.indexToString(-1);
                    }
                }
                if (result !== exports.LuaReturn.ErrorMem) {
                    try {
                        this.lua.luaL_traceback(this.address, this.address, null, 1);
                        const traceback = this.lua.lua_tolstring(this.address, -1, null);
                        if (traceback.trim() !== 'stack traceback:') {
                            error.message = `${error.message}\n${traceback}`;
                        }
                        this.pop(1);
                    }
                    catch (err) {
                        console.warn('Failed to generate stack trace', err);
                    }
                }
                throw error;
            }
        }
        getValueDecorations(value) {
            return value instanceof Decoration ? value : new Decoration(value, {});
        }
    }

    class Global extends Thread {
        constructor(cmodule, shouldTraceAllocations) {
            if (shouldTraceAllocations) {
                const memoryStats = { memoryUsed: 0 };
                const allocatorFunctionPointer = cmodule.module.addFunction((_userData, pointer, oldSize, newSize) => {
                    if (newSize === 0) {
                        if (pointer) {
                            memoryStats.memoryUsed -= oldSize;
                            cmodule.module._free(pointer);
                        }
                        return 0;
                    }
                    const endMemoryDelta = pointer ? newSize - oldSize : newSize;
                    const endMemory = memoryStats.memoryUsed + endMemoryDelta;
                    if (newSize > oldSize && memoryStats.memoryMax && endMemory > memoryStats.memoryMax) {
                        return 0;
                    }
                    const reallocated = cmodule.module._realloc(pointer, newSize);
                    if (reallocated) {
                        memoryStats.memoryUsed = endMemory;
                    }
                    return reallocated;
                }, 'iiiii');
                super(cmodule, [], cmodule.lua_newstate(allocatorFunctionPointer, null));
                this.memoryStats = memoryStats;
                this.allocatorFunctionPointer = allocatorFunctionPointer;
            }
            else {
                super(cmodule, [], cmodule.luaL_newstate());
            }
            if (this.isClosed()) {
                throw new Error('Global state could not be created (probably due to lack of memory)');
            }
        }
        close() {
            if (this.isClosed()) {
                return;
            }
            super.close();
            this.lua.lua_close(this.address);
            if (this.allocatorFunctionPointer) {
                this.lua.module.removeFunction(this.allocatorFunctionPointer);
            }
            for (const wrapper of this.typeExtensions) {
                wrapper.extension.close();
            }
        }
        registerTypeExtension(priority, extension) {
            this.typeExtensions.push({ extension, priority });
            this.typeExtensions.sort((a, b) => b.priority - a.priority);
        }
        loadLibrary(library) {
            switch (library) {
                case exports.LuaLibraries.Base:
                    this.lua.luaopen_base(this.address);
                    break;
                case exports.LuaLibraries.Coroutine:
                    this.lua.luaopen_coroutine(this.address);
                    break;
                case exports.LuaLibraries.Table:
                    this.lua.luaopen_table(this.address);
                    break;
                case exports.LuaLibraries.IO:
                    this.lua.luaopen_io(this.address);
                    break;
                case exports.LuaLibraries.OS:
                    this.lua.luaopen_os(this.address);
                    break;
                case exports.LuaLibraries.String:
                    this.lua.luaopen_string(this.address);
                    break;
                case exports.LuaLibraries.UTF8:
                    this.lua.luaopen_string(this.address);
                    break;
                case exports.LuaLibraries.Math:
                    this.lua.luaopen_math(this.address);
                    break;
                case exports.LuaLibraries.Debug:
                    this.lua.luaopen_debug(this.address);
                    break;
                case exports.LuaLibraries.Package:
                    this.lua.luaopen_package(this.address);
                    break;
            }
            this.lua.lua_setglobal(this.address, library);
        }
        get(name) {
            const type = this.lua.lua_getglobal(this.address, name);
            const value = this.getValue(-1, type);
            this.pop();
            return value;
        }
        set(name, value) {
            this.pushValue(value);
            this.lua.lua_setglobal(this.address, name);
        }
        getTable(name, callback) {
            const startStackTop = this.getTop();
            const type = this.lua.lua_getglobal(this.address, name);
            try {
                if (type !== exports.LuaType.Table) {
                    throw new TypeError(`Unexpected type in ${name}. Expected ${exports.LuaType[exports.LuaType.Table]}. Got ${exports.LuaType[type]}.`);
                }
                callback(startStackTop + 1);
            }
            finally {
                if (this.getTop() !== startStackTop + 1) {
                    console.warn(`getTable: expected stack size ${startStackTop} got ${this.getTop()}`);
                }
                this.setTop(startStackTop);
            }
        }
        getMemoryUsed() {
            return this.getMemoryStatsRef().memoryUsed;
        }
        getMemoryMax() {
            return this.getMemoryStatsRef().memoryMax;
        }
        setMemoryMax(max) {
            this.getMemoryStatsRef().memoryMax = max;
        }
        getMemoryStatsRef() {
            if (!this.memoryStats) {
                throw new Error('Memory allocations is not being traced, please build engine with { traceAllocations: true }');
            }
            return this.memoryStats;
        }
    }

    class LuaTypeExtension {
        constructor(thread, name) {
            this.thread = thread;
            this.name = name;
        }
        isType(_thread, _index, type, name) {
            return type === exports.LuaType.Userdata && name === this.name;
        }
        getValue(thread, index, _userdata) {
            const refUserdata = thread.lua.luaL_testudata(thread.address, index, this.name);
            if (!refUserdata) {
                throw new Error(`data does not have the expected metatable: ${this.name}`);
            }
            const referencePointer = thread.lua.module.getValue(refUserdata, '*');
            return thread.lua.getRef(referencePointer);
        }
        pushValue(thread, decoratedValue, _userdata) {
            const { target } = decoratedValue;
            const pointer = thread.lua.ref(target);
            const userDataPointer = thread.lua.lua_newuserdatauv(thread.address, PointerSize, 0);
            thread.lua.module.setValue(userDataPointer, pointer, '*');
            if (exports.LuaType.Nil === thread.lua.luaL_getmetatable(thread.address, this.name)) {
                thread.pop(2);
                throw new Error(`metatable not found: ${this.name}`);
            }
            thread.lua.lua_setmetatable(thread.address, -2);
            return true;
        }
    }

    class ErrorTypeExtension extends LuaTypeExtension {
        constructor(thread, injectObject) {
            super(thread, 'js_error');
            this.gcPointer = thread.lua.module.addFunction((functionStateAddress) => {
                const userDataPointer = thread.lua.luaL_checkudata(functionStateAddress, 1, this.name);
                const referencePointer = thread.lua.module.getValue(userDataPointer, '*');
                thread.lua.unref(referencePointer);
                return exports.LuaReturn.Ok;
            }, 'ii');
            if (thread.lua.luaL_newmetatable(thread.address, this.name)) {
                const metatableIndex = thread.lua.lua_gettop(thread.address);
                thread.lua.lua_pushstring(thread.address, 'protected metatable');
                thread.lua.lua_setfield(thread.address, metatableIndex, '__metatable');
                thread.lua.lua_pushcclosure(thread.address, this.gcPointer, 0);
                thread.lua.lua_setfield(thread.address, metatableIndex, '__gc');
                thread.pushValue((jsRefError, key) => {
                    if (key === 'message') {
                        return jsRefError.message;
                    }
                    return null;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__index');
                thread.pushValue((jsRefError) => {
                    return jsRefError.message;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__tostring');
            }
            thread.lua.lua_pop(thread.address, 1);
            if (injectObject) {
                thread.set('Error', {
                    create: (message) => {
                        if (message && typeof message !== 'string') {
                            throw new Error('message must be a string');
                        }
                        return new Error(message);
                    },
                });
            }
        }
        pushValue(thread, decoration) {
            if (!(decoration.target instanceof Error)) {
                return false;
            }
            return super.pushValue(thread, decoration);
        }
        close() {
            this.thread.lua.module.removeFunction(this.gcPointer);
        }
    }
    function createTypeExtension$5(thread, injectObject) {
        return new ErrorTypeExtension(thread, injectObject);
    }

    class RawResult {
        constructor(count) {
            this.count = count;
        }
    }

    function decorateFunction(target, options) {
        return new Decoration(target, options);
    }
    class FunctionTypeExtension extends LuaTypeExtension {
        constructor(thread) {
            super(thread, 'js_function');
            this.functionRegistry = typeof FinalizationRegistry !== 'undefined'
                ? new FinalizationRegistry((func) => {
                    if (!this.thread.isClosed()) {
                        this.thread.lua.luaL_unref(this.thread.address, LUA_REGISTRYINDEX, func);
                    }
                })
                : undefined;
            if (!this.functionRegistry) {
                console.warn('FunctionTypeExtension: FinalizationRegistry not found. Memory leaks likely.');
            }
            this.gcPointer = thread.lua.module.addFunction((calledL) => {
                thread.lua.luaL_checkudata(calledL, 1, this.name);
                const userDataPointer = thread.lua.luaL_checkudata(calledL, 1, this.name);
                const referencePointer = thread.lua.module.getValue(userDataPointer, '*');
                thread.lua.unref(referencePointer);
                return exports.LuaReturn.Ok;
            }, 'ii');
            if (thread.lua.luaL_newmetatable(thread.address, this.name)) {
                thread.lua.lua_pushstring(thread.address, '__gc');
                thread.lua.lua_pushcclosure(thread.address, this.gcPointer, 0);
                thread.lua.lua_settable(thread.address, -3);
                thread.lua.lua_pushstring(thread.address, '__metatable');
                thread.lua.lua_pushstring(thread.address, 'protected metatable');
                thread.lua.lua_settable(thread.address, -3);
            }
            thread.lua.lua_pop(thread.address, 1);
            this.functionWrapper = thread.lua.module.addFunction((calledL) => {
                const calledThread = thread.stateToThread(calledL);
                const refUserdata = thread.lua.luaL_checkudata(calledL, thread.lua.lua_upvalueindex(1), this.name);
                const refPointer = thread.lua.module.getValue(refUserdata, '*');
                const { target, options } = thread.lua.getRef(refPointer);
                const argsQuantity = calledThread.getTop();
                const args = [];
                if (options.receiveThread) {
                    args.push(calledThread);
                }
                if (options.receiveArgsQuantity) {
                    args.push(argsQuantity);
                }
                else {
                    for (let i = 1; i <= argsQuantity; i++) {
                        const value = calledThread.getValue(i);
                        if (i !== 1 || !(options === null || options === void 0 ? void 0 : options.self) || value !== options.self) {
                            args.push(value);
                        }
                    }
                }
                try {
                    const result = target.apply(options === null || options === void 0 ? void 0 : options.self, args);
                    if (result === undefined) {
                        return 0;
                    }
                    else if (result instanceof RawResult) {
                        return result.count;
                    }
                    else if (result instanceof MultiReturn) {
                        for (const item of result) {
                            calledThread.pushValue(item);
                        }
                        return result.length;
                    }
                    else {
                        calledThread.pushValue(result);
                        return 1;
                    }
                }
                catch (err) {
                    if (err === Infinity) {
                        throw err;
                    }
                    calledThread.pushValue(err);
                    return calledThread.lua.lua_error(calledThread.address);
                }
            }, 'ii');
        }
        close() {
            this.thread.lua.module.removeFunction(this.gcPointer);
            this.thread.lua.module.removeFunction(this.functionWrapper);
        }
        isType(_thread, _index, type) {
            return type === exports.LuaType.Function;
        }
        pushValue(thread, decoration) {
            if (typeof decoration.target !== 'function') {
                return false;
            }
            const pointer = thread.lua.ref(decoration);
            const userDataPointer = thread.lua.lua_newuserdatauv(thread.address, PointerSize, 0);
            thread.lua.module.setValue(userDataPointer, pointer, '*');
            if (exports.LuaType.Nil === thread.lua.luaL_getmetatable(thread.address, this.name)) {
                thread.pop(1);
                thread.lua.unref(pointer);
                throw new Error(`metatable not found: ${this.name}`);
            }
            thread.lua.lua_setmetatable(thread.address, -2);
            thread.lua.lua_pushcclosure(thread.address, this.functionWrapper, 1);
            return true;
        }
        getValue(thread, index) {
            var _a;
            thread.lua.lua_pushvalue(thread.address, index);
            const func = thread.lua.luaL_ref(thread.address, LUA_REGISTRYINDEX);
            const jsFunc = (...args) => {
                if (thread.isClosed()) {
                    console.warn('Tried to call a function after closing lua state');
                    return;
                }
                const internalType = thread.lua.lua_rawgeti(thread.address, LUA_REGISTRYINDEX, func);
                if (internalType !== exports.LuaType.Function) {
                    const callMetafieldType = thread.lua.luaL_getmetafield(thread.address, -1, '__call');
                    thread.pop();
                    if (callMetafieldType !== exports.LuaType.Function) {
                        throw new Error(`A value of type '${internalType}' was pushed but it is not callable`);
                    }
                }
                for (const arg of args) {
                    thread.pushValue(arg);
                }
                const status = thread.lua.lua_pcallk(thread.address, args.length, 1, 0, 0, null);
                if (status === exports.LuaReturn.Yield) {
                    throw new Error('cannot yield in callbacks from javascript');
                }
                thread.assertOk(status);
                const result = thread.getValue(-1);
                thread.pop();
                return result;
            };
            (_a = this.functionRegistry) === null || _a === void 0 ? void 0 : _a.register(jsFunc, func);
            return jsFunc;
        }
    }
    function createTypeExtension$4(thread) {
        return new FunctionTypeExtension(thread);
    }

    class PromiseTypeExtension extends LuaTypeExtension {
        constructor(thread, injectObject) {
            super(thread, 'js_promise');
            this.gcPointer = thread.lua.module.addFunction((functionStateAddress) => {
                const userDataPointer = thread.lua.luaL_checkudata(functionStateAddress, 1, this.name);
                const referencePointer = thread.lua.module.getValue(userDataPointer, '*');
                thread.lua.unref(referencePointer);
                return exports.LuaReturn.Ok;
            }, 'ii');
            if (thread.lua.luaL_newmetatable(thread.address, this.name)) {
                const metatableIndex = thread.lua.lua_gettop(thread.address);
                thread.lua.lua_pushstring(thread.address, 'protected metatable');
                thread.lua.lua_setfield(thread.address, metatableIndex, '__metatable');
                thread.lua.lua_pushcclosure(thread.address, this.gcPointer, 0);
                thread.lua.lua_setfield(thread.address, metatableIndex, '__gc');
                const checkSelf = (self) => {
                    if (Promise.resolve(self) !== self) {
                        throw new Error('promise method called without self instance');
                    }
                    return true;
                };
                thread.pushValue({
                    next: (self, ...args) => checkSelf(self) && self.then(...args),
                    catch: (self, ...args) => checkSelf(self) && self.catch(...args),
                    finally: (self, ...args) => checkSelf(self) && self.finally(...args),
                    await: decorateFunction((functionThread, self) => {
                        checkSelf(self);
                        if (functionThread.address === thread.address) {
                            throw new Error('cannot await in the main thread');
                        }
                        let promiseResult = undefined;
                        const awaitPromise = self
                            .then((res) => {
                            promiseResult = { status: 'fulfilled', value: res };
                        })
                            .catch((err) => {
                            promiseResult = { status: 'rejected', value: err };
                        });
                        const continuance = this.thread.lua.module.addFunction((continuanceState) => {
                            if (!promiseResult) {
                                return thread.lua.lua_yieldk(functionThread.address, 0, 0, continuance);
                            }
                            this.thread.lua.module.removeFunction(continuance);
                            const continuanceThread = thread.stateToThread(continuanceState);
                            if (promiseResult.status === 'rejected') {
                                continuanceThread.pushValue(promiseResult.value || new Error('promise rejected with no error'));
                                return this.thread.lua.lua_error(continuanceState);
                            }
                            if (promiseResult.value instanceof RawResult) {
                                return promiseResult.value.count;
                            }
                            else if (promiseResult.value instanceof MultiReturn) {
                                for (const arg of promiseResult.value) {
                                    continuanceThread.pushValue(arg);
                                }
                                return promiseResult.value.length;
                            }
                            else {
                                continuanceThread.pushValue(promiseResult.value);
                                return 1;
                            }
                        }, 'iiii');
                        functionThread.pushValue(awaitPromise);
                        return new RawResult(thread.lua.lua_yieldk(functionThread.address, 1, 0, continuance));
                    }, { receiveThread: true }),
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__index');
                thread.pushValue((self, other) => self === other);
                thread.lua.lua_setfield(thread.address, metatableIndex, '__eq');
            }
            thread.lua.lua_pop(thread.address, 1);
            if (injectObject) {
                thread.set('Promise', {
                    create: (callback) => new Promise(callback),
                    all: (promiseArray) => {
                        if (!Array.isArray(promiseArray)) {
                            throw new Error('argument must be an array of promises');
                        }
                        return Promise.all(promiseArray.map((potentialPromise) => Promise.resolve(potentialPromise)));
                    },
                    resolve: (value) => Promise.resolve(value),
                });
            }
        }
        close() {
            this.thread.lua.module.removeFunction(this.gcPointer);
        }
        pushValue(thread, decoration) {
            if (Promise.resolve(decoration.target) !== decoration.target) {
                return false;
            }
            return super.pushValue(thread, decoration);
        }
    }
    function createTypeExtension$3(thread, injectObject) {
        return new PromiseTypeExtension(thread, injectObject);
    }

    function decorateProxy(target, options) {
        return new Decoration(target, options || {});
    }
    class ProxyTypeExtension extends LuaTypeExtension {
        constructor(thread) {
            super(thread, 'js_proxy');
            this.gcPointer = thread.lua.module.addFunction((functionStateAddress) => {
                const userDataPointer = thread.lua.luaL_checkudata(functionStateAddress, 1, this.name);
                const referencePointer = thread.lua.module.getValue(userDataPointer, '*');
                thread.lua.unref(referencePointer);
                return exports.LuaReturn.Ok;
            }, 'ii');
            if (thread.lua.luaL_newmetatable(thread.address, this.name)) {
                const metatableIndex = thread.lua.lua_gettop(thread.address);
                thread.lua.lua_pushstring(thread.address, 'protected metatable');
                thread.lua.lua_setfield(thread.address, metatableIndex, '__metatable');
                thread.lua.lua_pushcclosure(thread.address, this.gcPointer, 0);
                thread.lua.lua_setfield(thread.address, metatableIndex, '__gc');
                thread.pushValue((self, key) => {
                    switch (typeof key) {
                        case 'number':
                            key = key - 1;
                        case 'string':
                            break;
                        default:
                            throw new Error('Only strings or numbers can index js objects');
                    }
                    const value = self[key];
                    if (typeof value === 'function') {
                        return decorateFunction(value, { self });
                    }
                    return value;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__index');
                thread.pushValue((self, key, value) => {
                    switch (typeof key) {
                        case 'number':
                            key = key - 1;
                        case 'string':
                            break;
                        default:
                            throw new Error('Only strings or numbers can index js objects');
                    }
                    self[key] = value;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__newindex');
                thread.pushValue((self) => {
                    var _a, _b;
                    return (_b = (_a = self.toString) === null || _a === void 0 ? void 0 : _a.call(self)) !== null && _b !== void 0 ? _b : typeof self;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__tostring');
                thread.pushValue((self) => {
                    return self.length || 0;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__len');
                thread.pushValue((self) => {
                    const keys = Object.getOwnPropertyNames(self);
                    let i = 0;
                    return MultiReturn.of(() => {
                        const ret = MultiReturn.of(keys[i], self[keys[i]]);
                        i++;
                        return ret;
                    }, self, null);
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__pairs');
                thread.pushValue((self, other) => {
                    return self === other;
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__eq');
                thread.pushValue((self, ...args) => {
                    if (args[0] === self) {
                        args.shift();
                    }
                    return self(...args);
                });
                thread.lua.lua_setfield(thread.address, metatableIndex, '__call');
            }
            thread.lua.lua_pop(thread.address, 1);
        }
        isType(_thread, _index, type, name) {
            return type === exports.LuaType.Userdata && name === this.name;
        }
        getValue(thread, index) {
            const refUserdata = thread.lua.lua_touserdata(thread.address, index);
            const referencePointer = thread.lua.module.getValue(refUserdata, '*');
            return thread.lua.getRef(referencePointer);
        }
        pushValue(thread, decoratedValue) {
            var _a;
            const { target, options } = decoratedValue;
            if (options.proxy === undefined) {
                if (target === null || target === undefined) {
                    return false;
                }
                if (typeof target !== 'object') {
                    const isClass = typeof target === 'function' && ((_a = target.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === target && target.toString().startsWith('class ');
                    if (!isClass) {
                        return false;
                    }
                }
                if (Promise.resolve(target) === target) {
                    return false;
                }
            }
            else if (options.proxy === false) {
                return false;
            }
            if (options.metatable && !(options.metatable instanceof Decoration)) {
                decoratedValue.options.metatable = decorateProxy(options.metatable, { proxy: false });
                return false;
            }
            return super.pushValue(thread, decoratedValue);
        }
        close() {
            this.thread.lua.module.removeFunction(this.gcPointer);
        }
    }
    function createTypeExtension$2(thread) {
        return new ProxyTypeExtension(thread);
    }

    class TableTypeExtension extends LuaTypeExtension {
        constructor(thread) {
            super(thread, 'js_table');
        }
        close() {
        }
        isType(_thread, _index, type) {
            return type === exports.LuaType.Table;
        }
        getValue(thread, index, userdata) {
            const seenMap = userdata || new Map();
            const pointer = thread.lua.lua_topointer(thread.address, index);
            let table = seenMap.get(pointer);
            if (!table) {
                const keys = this.readTableKeys(thread, index);
                const isSequential = keys.length > 0 && keys.every((key, index) => key === String(index + 1));
                table = isSequential ? [] : {};
                seenMap.set(pointer, table);
                this.readTableValues(thread, index, seenMap, table);
            }
            return table;
        }
        pushValue(thread, { target }, userdata) {
            if (typeof target !== 'object' || target === null) {
                return false;
            }
            const seenMap = userdata || new Map();
            const existingReference = seenMap.get(target);
            if (existingReference !== undefined) {
                thread.lua.lua_rawgeti(thread.address, LUA_REGISTRYINDEX, existingReference);
                return true;
            }
            try {
                const tableIndex = thread.getTop() + 1;
                const createTable = (arrayCount, keyCount) => {
                    thread.lua.lua_createtable(thread.address, arrayCount, keyCount);
                    const ref = thread.lua.luaL_ref(thread.address, LUA_REGISTRYINDEX);
                    seenMap.set(target, ref);
                    thread.lua.lua_rawgeti(thread.address, LUA_REGISTRYINDEX, ref);
                };
                if (Array.isArray(target)) {
                    createTable(target.length, 0);
                    for (let i = 0; i < target.length; i++) {
                        thread.pushValue(i + 1, seenMap);
                        thread.pushValue(target[i], seenMap);
                        thread.lua.lua_settable(thread.address, tableIndex);
                    }
                }
                else {
                    createTable(0, Object.getOwnPropertyNames(target).length);
                    for (const key in target) {
                        thread.pushValue(key, seenMap);
                        thread.pushValue(target[key], seenMap);
                        thread.lua.lua_settable(thread.address, tableIndex);
                    }
                }
            }
            finally {
                if (userdata === undefined) {
                    for (const reference of seenMap.values()) {
                        thread.lua.luaL_unref(thread.address, LUA_REGISTRYINDEX, reference);
                    }
                }
            }
            return true;
        }
        readTableKeys(thread, index) {
            const keys = [];
            thread.lua.lua_pushnil(thread.address);
            while (thread.lua.lua_next(thread.address, index)) {
                const key = thread.indexToString(-2);
                keys.push(key);
                thread.pop();
            }
            return keys;
        }
        readTableValues(thread, index, seenMap, table) {
            const isArray = Array.isArray(table);
            thread.lua.lua_pushnil(thread.address);
            while (thread.lua.lua_next(thread.address, index)) {
                const key = thread.indexToString(-2);
                const value = thread.getValue(-1, undefined, seenMap);
                if (isArray) {
                    table.push(value);
                }
                else {
                    table[key] = value;
                }
                thread.pop();
            }
        }
    }
    function createTypeExtension$1(thread) {
        return new TableTypeExtension(thread);
    }

    function decorateUserdata(target) {
        return new Decoration(target, { reference: true });
    }
    class UserdataTypeExtension extends LuaTypeExtension {
        constructor(thread) {
            super(thread, 'js_userdata');
            this.gcPointer = thread.lua.module.addFunction((functionStateAddress) => {
                const userDataPointer = thread.lua.luaL_checkudata(functionStateAddress, 1, this.name);
                const referencePointer = thread.lua.module.getValue(userDataPointer, '*');
                thread.lua.unref(referencePointer);
                return exports.LuaReturn.Ok;
            }, 'ii');
            if (thread.lua.luaL_newmetatable(thread.address, this.name)) {
                const metatableIndex = thread.lua.lua_gettop(thread.address);
                thread.lua.lua_pushstring(thread.address, 'protected metatable');
                thread.lua.lua_setfield(thread.address, metatableIndex, '__metatable');
                thread.lua.lua_pushcclosure(thread.address, this.gcPointer, 0);
                thread.lua.lua_setfield(thread.address, metatableIndex, '__gc');
            }
            thread.lua.lua_pop(thread.address, 1);
        }
        isType(_thread, _index, type, name) {
            return type === exports.LuaType.Userdata && name === this.name;
        }
        getValue(thread, index) {
            const refUserdata = thread.lua.lua_touserdata(thread.address, index);
            const referencePointer = thread.lua.module.getValue(refUserdata, '*');
            return thread.lua.getRef(referencePointer);
        }
        pushValue(thread, decoratedValue) {
            if (!decoratedValue.options.reference) {
                return false;
            }
            return super.pushValue(thread, decoratedValue);
        }
        close() {
            this.thread.lua.module.removeFunction(this.gcPointer);
        }
    }
    function createTypeExtension(thread) {
        return new UserdataTypeExtension(thread);
    }

    class LuaEngine {
        constructor(cmodule, { openStandardLibs = true, injectObjects = false, enableProxy = true, traceAllocations = false } = {}) {
            this.cmodule = cmodule;
            this.global = new Global(this.cmodule, traceAllocations);
            this.global.registerTypeExtension(0, createTypeExtension$1(this.global));
            this.global.registerTypeExtension(0, createTypeExtension$4(this.global));
            this.global.registerTypeExtension(1, createTypeExtension$3(this.global, injectObjects));
            if (enableProxy) {
                this.global.registerTypeExtension(3, createTypeExtension$2(this.global));
            }
            else {
                this.global.registerTypeExtension(1, createTypeExtension$5(this.global, injectObjects));
            }
            this.global.registerTypeExtension(4, createTypeExtension(this.global));
            if (openStandardLibs) {
                this.cmodule.luaL_openlibs(this.global.address);
            }
        }
        doString(script) {
            return this.callByteCode((thread) => thread.loadString(script));
        }
        doFile(filename) {
            return this.callByteCode((thread) => thread.loadFile(filename));
        }
        doStringSync(script) {
            this.global.loadString(script);
            const result = this.global.runSync();
            return result[0];
        }
        doFileSync(filename) {
            this.global.loadFile(filename);
            const result = this.global.runSync();
            return result[0];
        }
        async callByteCode(loader) {
            const thread = this.global.newThread();
            const threadIndex = this.global.getTop();
            try {
                loader(thread);
                const result = await thread.run(0);
                if (result.length > 0) {
                    this.cmodule.lua_xmove(thread.address, this.global.address, result.length);
                }
                return result[0];
            }
            finally {
                this.global.remove(threadIndex);
            }
        }
    }

    var initWasmModule = (() => {
      var _scriptDir = (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href));
      
      return (
    async function(moduleArg = {}) {

    var e=moduleArg,aa,ba;e.ready=new Promise((a,b)=>{aa=a;ba=b;});var ca=Object.assign({},e),da="./this.program",ea=(a,b)=>{throw b;},fa="object"==typeof window,f="function"==typeof importScripts,ha="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,k="",ia,ja,ka;
    if(ha){const {createRequire:a}=await import('module');var require$1=a((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href))),fs=require$1("fs"),la=require$1("path");f?k=la.dirname(k)+"/":k=require$1("url").fileURLToPath(new URL("./",(typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href))));ia=(b,c)=>{b=ma(b)?new URL(b):la.normalize(b);return fs.readFileSync(b,c?void 0:"utf8")};ka=b=>{b=ia(b,!0);b.buffer||(b=new Uint8Array(b));return b};ja=(b,c,d,g=!0)=>{b=ma(b)?new URL(b):la.normalize(b);fs.readFile(b,g?void 0:"utf8",(h,m)=>{h?d(h):c(g?m.buffer:m);});};
    !e.thisProgram&&1<process.argv.length&&(da=process.argv[1].replace(/\\/g,"/"));process.argv.slice(2);ea=(b,c)=>{process.exitCode=b;throw c;};e.inspect=()=>"[Emscripten Module object]";}else if(fa||f)f?k=self.location.href:"undefined"!=typeof document&&document.currentScript&&(k=document.currentScript.src),_scriptDir&&(k=_scriptDir),0!==k.indexOf("blob:")?k=k.substr(0,k.replace(/[?#].*/,"").lastIndexOf("/")+1):k="",ia=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},
    f&&(ka=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),ja=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c();};d.onerror=c;d.send(null);};var na=e.print||console.log.bind(console),p=e.printErr||console.error.bind(console);Object.assign(e,ca);ca=null;"object"!=typeof WebAssembly&&x("no native wasm support detected");
    var oa,pa=!1,y,A,qa,B,C,ra,sa;function ta(){var a=oa.buffer;e.HEAP8=y=new Int8Array(a);e.HEAP16=qa=new Int16Array(a);e.HEAPU8=A=new Uint8Array(a);e.HEAPU16=new Uint16Array(a);e.HEAP32=B=new Int32Array(a);e.HEAPU32=C=new Uint32Array(a);e.HEAPF32=ra=new Float32Array(a);e.HEAPF64=sa=new Float64Array(a);}var ua=[],va=[],wa=[],E=0,ya=null;function za(){E--;if(0==E&&(ya)){var a=ya;ya=null;a();}}
    function x(a){a="Aborted("+a+")";p(a);pa=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");ba(a);throw a;}var Aa=a=>a.startsWith("data:application/octet-stream;base64,"),ma=a=>a.startsWith("file://"),Ba;if(e.locateFile){if(Ba="glue.wasm",!Aa(Ba)){var Ca=Ba;Ba=e.locateFile?e.locateFile(Ca,k):k+Ca;}}else Ba=(new URL("glue.wasm",(typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href)))).href;function Da(a){if(ka)return ka(a);throw "both async and sync fetching of the wasm failed";}
    function Ea(a){if(fa||f){if("function"==typeof fetch&&!ma(a))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw "failed to load wasm binary file at '"+a+"'";return b.arrayBuffer()}).catch(()=>Da(a));if(ja)return new Promise((b,c)=>{ja(a,d=>b(new Uint8Array(d)),c);})}return Promise.resolve().then(()=>Da(a))}function Fa(a,b,c){return Ea(a).then(d=>WebAssembly.instantiate(d,b)).then(d=>d).then(c,d=>{p(`failed to asynchronously prepare wasm: ${d}`);x(d);})}
    function Ga(a,b){var c=Ba;return "function"!=typeof WebAssembly.instantiateStreaming||Aa(c)||ma(c)||ha||"function"!=typeof fetch?Fa(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(g){p(`wasm streaming compile failed: ${g}`);p("falling back to ArrayBuffer instantiation");return Fa(c,a,b)}))}var F,Ha;function Ia(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a;}
    var Ja=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var g=a[d];"."===g?a.splice(d,1):".."===g?(a.splice(d,1),c++):c&&(a.splice(d,1),c--);}if(b)for(;c;c--)a.unshift("..");return a},H=a=>{var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=Ja(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return (b?"/":"")+a},Ka=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return ".";b&&(b=b.substr(0,b.length-1));return a+b},J=a=>{if("/"===
    a)return "/";a=H(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return -1===b?a:a.substr(b+1)},La=(a,b)=>H(a+"/"+b),Ma=()=>{if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues)return c=>crypto.getRandomValues(c);if(ha)try{var a=require$1("crypto");if(a.randomFillSync)return c=>a.randomFillSync(c);var b=a.randomBytes;return c=>(c.set(b(c.byteLength)),c)}catch(c){}x("initRandomDevice");},Na=a=>(Na=Ma())(a);
    function K(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:L.cwd();if("string"!=typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return "";a=b+"/"+a;b="/"===b.charAt(0);}a=Ja(a.split("/").filter(d=>!!d),!b).join("/");return (b?"/":"")+a||"."}
    var Pa=(a,b)=>{function c(m){for(var q=0;q<m.length&&""===m[q];q++);for(var v=m.length-1;0<=v&&""===m[v];v--);return q>v?[]:m.slice(q,v-q+1)}a=K(a).substr(1);b=K(b).substr(1);a=c(a.split("/"));b=c(b.split("/"));for(var d=Math.min(a.length,b.length),g=d,h=0;h<d;h++)if(a[h]!==b[h]){g=h;break}d=[];for(h=g;h<a.length;h++)d.push("..");d=d.concat(b.slice(g));return d.join("/")},Qa="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,N=(a,b)=>{for(var c=b+NaN,d=b;a[d]&&!(d>=c);)++d;if(16<d-b&&
    a.buffer&&Qa)return Qa.decode(a.subarray(b,d));for(c="";b<d;){var g=a[b++];if(g&128){var h=a[b++]&63;if(192==(g&224))c+=String.fromCharCode((g&31)<<6|h);else {var m=a[b++]&63;g=224==(g&240)?(g&15)<<12|h<<6|m:(g&7)<<18|h<<12|m<<6|a[b++]&63;65536>g?c+=String.fromCharCode(g):(g-=65536,c+=String.fromCharCode(55296|g>>10,56320|g&1023));}}else c+=String.fromCharCode(g);}return c},Ra=[],Sa=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3;}return b},
    Ta=(a,b,c,d)=>{if(!(0<d))return 0;var g=c;d=c+d-1;for(var h=0;h<a.length;++h){var m=a.charCodeAt(h);if(55296<=m&&57343>=m){var q=a.charCodeAt(++h);m=65536+((m&1023)<<10)|q&1023;}if(127>=m){if(c>=d)break;b[c++]=m;}else {if(2047>=m){if(c+1>=d)break;b[c++]=192|m>>6;}else {if(65535>=m){if(c+2>=d)break;b[c++]=224|m>>12;}else {if(c+3>=d)break;b[c++]=240|m>>18;b[c++]=128|m>>12&63;}b[c++]=128|m>>6&63;}b[c++]=128|m&63;}}b[c]=0;return c-g};
    function Ua(a,b){var c=Array(Sa(a)+1);a=Ta(a,c,0,c.length);b&&(c.length=a);return c}var Va=[];function Wa(a,b){Va[a]={input:[],output:[],Rc:b};Xa(a,Ya);}
    var Ya={open(a){var b=Va[a.node.rdev];if(!b)throw new L.Ac(43);a.tty=b;a.seekable=!1;},close(a){a.tty.Rc.fsync(a.tty);},fsync(a){a.tty.Rc.fsync(a.tty);},read(a,b,c,d){if(!a.tty||!a.tty.Rc.xd)throw new L.Ac(60);for(var g=0,h=0;h<d;h++){try{var m=a.tty.Rc.xd(a.tty);}catch(q){throw new L.Ac(29);}if(void 0===m&&0===g)throw new L.Ac(6);if(null===m||void 0===m)break;g++;b[c+h]=m;}g&&(a.node.timestamp=Date.now());return g},write(a,b,c,d){if(!a.tty||!a.tty.Rc.od)throw new L.Ac(60);try{for(var g=0;g<d;g++)a.tty.Rc.od(a.tty,
    b[c+g]);}catch(h){throw new L.Ac(29);}d&&(a.node.timestamp=Date.now());return g}},Za={xd(){a:{if(!Ra.length){var a=null;if(ha){var b=Buffer.alloc(256),c=0,d=process.stdin.fd;try{c=fs.readSync(d,b);}catch(g){if(g.toString().includes("EOF"))c=0;else throw g;}0<c?a=b.slice(0,c).toString("utf-8"):a=null;}else "undefined"!=typeof window&&"function"==typeof window.prompt?(a=window.prompt("Input: "),null!==a&&(a+="\n")):"function"==typeof readline&&(a=readline(),null!==a&&(a+="\n"));if(!a){a=null;break a}Ra=
    Ua(a,!0);}a=Ra.shift();}return a},od(a,b){null===b||10===b?(na(N(a.output,0)),a.output=[]):0!=b&&a.output.push(b);},fsync(a){a.output&&0<a.output.length&&(na(N(a.output,0)),a.output=[]);},Od(){return {ce:25856,ee:5,be:191,de:35387,ae:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},Pd(){return 0},Qd(){return [24,80]}},$a={od(a,b){null===b||10===b?(p(N(a.output,0)),a.output=[]):0!=b&&a.output.push(b);},fsync(a){a.output&&0<a.output.length&&(p(N(a.output,0)),a.output=[]);}};
    function ab(a,b){var c=a.Dc?a.Dc.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.Dc,a.Dc=new Uint8Array(b),0<a.Ec&&a.Dc.set(c.subarray(0,a.Ec),0));}
    var O={Nc:null,Fc(){return O.createNode(null,"/",16895,0)},createNode(a,b,c,d){if(24576===(c&61440)||L.isFIFO(c))throw new L.Ac(63);O.Nc||(O.Nc={dir:{node:{Kc:O.Bc.Kc,Gc:O.Bc.Gc,lookup:O.Bc.lookup,Qc:O.Bc.Qc,rename:O.Bc.rename,unlink:O.Bc.unlink,rmdir:O.Bc.rmdir,readdir:O.Bc.readdir,symlink:O.Bc.symlink},stream:{Lc:O.Cc.Lc}},file:{node:{Kc:O.Bc.Kc,Gc:O.Bc.Gc},stream:{Lc:O.Cc.Lc,read:O.Cc.read,write:O.Cc.write,Yc:O.Cc.Yc,Xc:O.Cc.Xc,ad:O.Cc.ad}},link:{node:{Kc:O.Bc.Kc,Gc:O.Bc.Gc,readlink:O.Bc.readlink},
    stream:{}},td:{node:{Kc:O.Bc.Kc,Gc:O.Bc.Gc},stream:L.Kd}});c=L.createNode(a,b,c,d);P(c.mode)?(c.Bc=O.Nc.dir.node,c.Cc=O.Nc.dir.stream,c.Dc={}):L.isFile(c.mode)?(c.Bc=O.Nc.file.node,c.Cc=O.Nc.file.stream,c.Ec=0,c.Dc=null):40960===(c.mode&61440)?(c.Bc=O.Nc.link.node,c.Cc=O.Nc.link.stream):8192===(c.mode&61440)&&(c.Bc=O.Nc.td.node,c.Cc=O.Nc.td.stream);c.timestamp=Date.now();a&&(a.Dc[b]=c,a.timestamp=c.timestamp);return c},ke(a){return a.Dc?a.Dc.subarray?a.Dc.subarray(0,a.Ec):new Uint8Array(a.Dc):new Uint8Array(0)},
    Bc:{Kc(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;P(a.mode)?b.size=4096:L.isFile(a.mode)?b.size=a.Ec:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.Id=4096;b.blocks=Math.ceil(b.size/b.Id);return b},Gc(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);if(void 0!==b.size&&(b=b.size,a.Ec!=b))if(0==b)a.Dc=
    null,a.Ec=0;else {var c=a.Dc;a.Dc=new Uint8Array(b);c&&a.Dc.set(c.subarray(0,Math.min(b,a.Ec)));a.Ec=b;}},lookup(){throw L.hd[44];},Qc(a,b,c,d){return O.createNode(a,b,c,d)},rename(a,b,c){if(P(a.mode)){try{var d=Q(b,c);}catch(h){}if(d)for(var g in d.Dc)throw new L.Ac(55);}delete a.parent.Dc[a.name];a.parent.timestamp=Date.now();a.name=c;b.Dc[c]=a;b.timestamp=a.parent.timestamp;a.parent=b;},unlink(a,b){delete a.Dc[b];a.timestamp=Date.now();},rmdir(a,b){var c=Q(a,b),d;for(d in c.Dc)throw new L.Ac(55);delete a.Dc[b];
    a.timestamp=Date.now();},readdir(a){var b=[".",".."],c;for(c in a.Dc)a.Dc.hasOwnProperty(c)&&b.push(c);return b},symlink(a,b,c){a=O.createNode(a,b,41471,0);a.link=c;return a},readlink(a){if(40960!==(a.mode&61440))throw new L.Ac(28);return a.link}},Cc:{read(a,b,c,d,g){var h=a.node.Dc;if(g>=a.node.Ec)return 0;a=Math.min(a.node.Ec-g,d);if(8<a&&h.subarray)b.set(h.subarray(g,g+a),c);else for(d=0;d<a;d++)b[c+d]=h[g+d];return a},write(a,b,c,d,g,h){b.buffer===y.buffer&&(h=!1);if(!d)return 0;a=a.node;a.timestamp=
    Date.now();if(b.subarray&&(!a.Dc||a.Dc.subarray)){if(h)return a.Dc=b.subarray(c,c+d),a.Ec=d;if(0===a.Ec&&0===g)return a.Dc=b.slice(c,c+d),a.Ec=d;if(g+d<=a.Ec)return a.Dc.set(b.subarray(c,c+d),g),d}ab(a,g+d);if(a.Dc.subarray&&b.subarray)a.Dc.set(b.subarray(c,c+d),g);else for(h=0;h<d;h++)a.Dc[g+h]=b[c+h];a.Ec=Math.max(a.Ec,g+d);return d},Lc(a,b,c){1===c?b+=a.position:2===c&&L.isFile(a.node.mode)&&(b+=a.node.Ec);if(0>b)throw new L.Ac(28);return b},Yc(a,b,c){ab(a.node,b+c);a.node.Ec=Math.max(a.node.Ec,
    b+c);},Xc(a,b,c,d,g){if(!L.isFile(a.node.mode))throw new L.Ac(43);a=a.node.Dc;if(g&2||a.buffer!==y.buffer){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,c+b):a=Array.prototype.slice.call(a,c,c+b);c=!0;x();b=void 0;if(!b)throw new L.Ac(48);y.set(a,b);}else c=!1,b=a.byteOffset;return {pe:b,$d:c}},ad(a,b,c,d){O.Cc.write(a,b,0,d,c,!1);return 0}}},bb=(a,b,c)=>{var d=`al ${a}`;ja(a,g=>{g||x(`Loading data file "${a}" failed (no arrayBuffer).`);b(new Uint8Array(g));d&&za();},()=>{if(c)c();else throw `Loading data file "${a}" failed.`;
    });d&&E++;},cb=[],db=(a,b,c,d)=>{"undefined"!=typeof Browser&&Browser.Zc();var g=!1;cb.forEach(h=>{!g&&h.canHandle(b)&&(h.handle(a,b,c,d),g=!0);});return g},eb=(a,b)=>{var c=0;a&&(c|=365);b&&(c|=146);return c};function Xa(a,b){L.vd[a]={Cc:b};}function P(a){return 16384===(a&61440)}function Q(a,b){var c;if(c=(c=R(a,"x"))?c:a.Bc.lookup?0:2)throw new L.Ac(c,a);for(c=L.Mc[fb(a.id,b)];c;c=c.Uc){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return L.lookup(a,b)}
    function S(a,b={}){a=K(a);if(!a)return {path:"",node:null};b=Object.assign({gd:!0,qd:0},b);if(8<b.qd)throw new L.Ac(32);a=a.split("/").filter(m=>!!m);for(var c=L.root,d="/",g=0;g<a.length;g++){var h=g===a.length-1;if(h&&b.parent)break;c=Q(c,a[g]);d=H(d+"/"+a[g]);c.Ic&&(!h||h&&b.gd)&&(c=c.Ic.root);if(!h||b.Jc)for(h=0;40960===(c.mode&61440);)if(c=L.readlink(d),d=K(Ka(d),c),c=S(d,{qd:b.qd+1}).node,40<h++)throw new L.Ac(32);}return {path:d,node:c}}
    function T(a){for(var b;;){if(L.Ad(a))return a=a.Fc.Bd,b?"/"!==a[a.length-1]?`${a}/${b}`:a+b:a;b=b?`${a.name}/${b}`:a.name;a=a.parent;}}function fb(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return (a+c>>>0)%L.Mc.length}function gb(a){var b=fb(a.parent.id,a.name);a.Uc=L.Mc[b];L.Mc[b]=a;}function hb(a){var b=fb(a.parent.id,a.name);if(L.Mc[b]===a)L.Mc[b]=a.Uc;else for(b=L.Mc[b];b;){if(b.Uc===a){b.Uc=a.Uc;break}b=b.Uc;}}
    function ib(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}function R(a,b){if(L.zd)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0}function jb(a,b){try{return Q(a,b),20}catch(c){}return R(a,"wx")}function kb(a,b,c){try{var d=Q(a,b);}catch(g){return g.Hc}if(a=R(a,"wx"))return a;if(c){if(!P(d.mode))return 54;if(L.Ad(d)||T(d)===L.cwd())return 10}else if(P(d.mode))return 31;return 0}
    function lb(){for(var a=0;a<=L.Fd;a++)if(!L.streams[a])return a;throw new L.Ac(33);}function U(a){a=L.wd(a);if(!a)throw new L.Ac(8);return a}
    function mb(a,b=-1){L.bd||(L.bd=function(){this.Pc={};},L.bd.prototype={},Object.defineProperties(L.bd.prototype,{object:{get(){return this.node},set(c){this.node=c;}},flags:{get(){return this.Pc.flags},set(c){this.Pc.flags=c;}},position:{get(){return this.Pc.position},set(c){this.Pc.position=c;}}}));a=Object.assign(new L.bd,a);-1==b&&(b=lb());a.fd=b;return L.streams[b]=a}function nb(a){var b=[];for(a=[a];a.length;){var c=a.pop();b.push(c);a.push.apply(a,c.$c);}return b}
    function ob(a,b,c){"undefined"==typeof c&&(c=b,b=438);return L.Qc(a,b|8192,c)}function pb(){L.Ac||(L.Ac=function(a,b){this.name="ErrnoError";this.node=b;this.Ud=function(c){this.Hc=c;};this.Ud(a);this.message="FS error";},L.Ac.prototype=Error(),L.Ac.prototype.constructor=L.Ac,[44].forEach(a=>{L.hd[a]=new L.Ac(a);L.hd[a].stack="<generic error, no stack>";}));}function qb(a,b,c,d){a="string"==typeof a?a:T(a);b=H(a+"/"+b);return L.create(b,eb(c,d))}
    function rb(a){if(!(a.Rd||a.Sd||a.link||a.Dc)){if("undefined"!=typeof XMLHttpRequest)throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(ia)try{a.Dc=Ua(ia(a.url),!0),a.Ec=a.Dc.length;}catch(b){throw new L.Ac(29);}else throw Error("Cannot load without read() or XMLHttpRequest.");}}
    var L={root:null,$c:[],vd:{},streams:[],Td:1,Mc:null,ud:"/",kd:!1,zd:!0,Ac:null,hd:{},Md:null,cd:0,createNode(a,b,c,d){a=new L.Ed(a,b,c,d);gb(a);return a},Ad(a){return a===a.parent},isFile(a){return 32768===(a&61440)},isFIFO(a){return 4096===(a&61440)},isSocket(a){return 49152===(a&49152)},Fd:4096,wd:a=>L.streams[a],Kd:{open(a){a.Cc=L.Nd(a.node.rdev).Cc;a.Cc.open&&a.Cc.open(a);},Lc(){throw new L.Ac(70);}},nd:a=>a>>8,le:a=>a&255,Tc:(a,b)=>a<<8|b,Nd:a=>L.vd[a],Cd(a,b){function c(m){L.cd--;return b(m)}
    function d(m){if(m){if(!d.Ld)return d.Ld=!0,c(m)}else ++h>=g.length&&c(null);}"function"==typeof a&&(b=a,a=!1);L.cd++;1<L.cd&&p(`warning: ${L.cd} FS.syncfs operations in flight at once, probably just doing extra work`);var g=nb(L.root.Fc),h=0;g.forEach(m=>{if(!m.type.Cd)return d(null);m.type.Cd(m,a,d);});},Fc(a,b,c){var d="/"===c,g=!c;if(d&&L.root)throw new L.Ac(10);if(!d&&!g){var h=S(c,{gd:!1});c=h.path;h=h.node;if(h.Ic)throw new L.Ac(10);if(!P(h.mode))throw new L.Ac(54);}b={type:a,oe:b,Bd:c,$c:[]};
    a=a.Fc(b);a.Fc=b;b.root=a;d?L.root=a:h&&(h.Ic=b,h.Fc&&h.Fc.$c.push(b));return a},ue(a){a=S(a,{gd:!1});if(!a.node.Ic)throw new L.Ac(28);a=a.node;var b=a.Ic,c=nb(b);Object.keys(L.Mc).forEach(d=>{for(d=L.Mc[d];d;){var g=d.Uc;c.includes(d.Fc)&&hb(d);d=g;}});a.Ic=null;a.Fc.$c.splice(a.Fc.$c.indexOf(b),1);},lookup(a,b){return a.Bc.lookup(a,b)},Qc(a,b,c){var d=S(a,{parent:!0}).node;a=J(a);if(!a||"."===a||".."===a)throw new L.Ac(28);var g=jb(d,a);if(g)throw new L.Ac(g);if(!d.Bc.Qc)throw new L.Ac(63);return d.Bc.Qc(d,
    a,b,c)},create(a,b){return L.Qc(a,(void 0!==b?b:438)&4095|32768,0)},mkdir(a,b){return L.Qc(a,(void 0!==b?b:511)&1023|16384,0)},me(a,b){a=a.split("/");for(var c="",d=0;d<a.length;++d)if(a[d]){c+="/"+a[d];try{L.mkdir(c,b);}catch(g){if(20!=g.Hc)throw g;}}},symlink(a,b){if(!K(a))throw new L.Ac(44);var c=S(b,{parent:!0}).node;if(!c)throw new L.Ac(44);b=J(b);var d=jb(c,b);if(d)throw new L.Ac(d);if(!c.Bc.symlink)throw new L.Ac(63);return c.Bc.symlink(c,b,a)},rename(a,b){var c=Ka(a),d=Ka(b),g=J(a),h=J(b);
    var m=S(a,{parent:!0});var q=m.node;m=S(b,{parent:!0});m=m.node;if(!q||!m)throw new L.Ac(44);if(q.Fc!==m.Fc)throw new L.Ac(75);var v=Q(q,g);a=Pa(a,d);if("."!==a.charAt(0))throw new L.Ac(28);a=Pa(b,c);if("."!==a.charAt(0))throw new L.Ac(55);try{var r=Q(m,h);}catch(n){}if(v!==r){b=P(v.mode);if(g=kb(q,g,b))throw new L.Ac(g);if(g=r?kb(m,h,b):jb(m,h))throw new L.Ac(g);if(!q.Bc.rename)throw new L.Ac(63);if(v.Ic||r&&r.Ic)throw new L.Ac(10);if(m!==q&&(g=R(q,"w")))throw new L.Ac(g);hb(v);try{q.Bc.rename(v,
    m,h);}catch(n){throw n;}finally{gb(v);}}},rmdir(a){var b=S(a,{parent:!0}).node;a=J(a);var c=Q(b,a),d=kb(b,a,!0);if(d)throw new L.Ac(d);if(!b.Bc.rmdir)throw new L.Ac(63);if(c.Ic)throw new L.Ac(10);b.Bc.rmdir(b,a);hb(c);},readdir(a){a=S(a,{Jc:!0}).node;if(!a.Bc.readdir)throw new L.Ac(54);return a.Bc.readdir(a)},unlink(a){var b=S(a,{parent:!0}).node;if(!b)throw new L.Ac(44);a=J(a);var c=Q(b,a),d=kb(b,a,!1);if(d)throw new L.Ac(d);if(!b.Bc.unlink)throw new L.Ac(63);if(c.Ic)throw new L.Ac(10);b.Bc.unlink(b,
    a);hb(c);},readlink(a){a=S(a).node;if(!a)throw new L.Ac(44);if(!a.Bc.readlink)throw new L.Ac(28);return K(T(a.parent),a.Bc.readlink(a))},stat(a,b){a=S(a,{Jc:!b}).node;if(!a)throw new L.Ac(44);if(!a.Bc.Kc)throw new L.Ac(63);return a.Bc.Kc(a)},lstat(a){return L.stat(a,!0)},chmod(a,b,c){a="string"==typeof a?S(a,{Jc:!c}).node:a;if(!a.Bc.Gc)throw new L.Ac(63);a.Bc.Gc(a,{mode:b&4095|a.mode&-4096,timestamp:Date.now()});},lchmod(a,b){L.chmod(a,b,!0);},fchmod(a,b){a=U(a);L.chmod(a.node,b);},chown(a,b,c,d){a="string"==
    typeof a?S(a,{Jc:!d}).node:a;if(!a.Bc.Gc)throw new L.Ac(63);a.Bc.Gc(a,{timestamp:Date.now()});},lchown(a,b,c){L.chown(a,b,c,!0);},fchown(a,b,c){a=U(a);L.chown(a.node,b,c);},truncate(a,b){if(0>b)throw new L.Ac(28);a="string"==typeof a?S(a,{Jc:!0}).node:a;if(!a.Bc.Gc)throw new L.Ac(63);if(P(a.mode))throw new L.Ac(31);if(!L.isFile(a.mode))throw new L.Ac(28);var c=R(a,"w");if(c)throw new L.Ac(c);a.Bc.Gc(a,{size:b,timestamp:Date.now()});},je(a,b){a=U(a);if(0===(a.flags&2097155))throw new L.Ac(28);L.truncate(a.node,
    b);},ve(a,b,c){a=S(a,{Jc:!0}).node;a.Bc.Gc(a,{timestamp:Math.max(b,c)});},open(a,b,c){if(""===a)throw new L.Ac(44);if("string"==typeof b){var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090}[b];if("undefined"==typeof d)throw Error(`Unknown file open mode: ${b}`);b=d;}c=b&64?("undefined"==typeof c?438:c)&4095|32768:0;if("object"==typeof a)var g=a;else {a=H(a);try{g=S(a,{Jc:!(b&131072)}).node;}catch(h){}}d=!1;if(b&64)if(g){if(b&128)throw new L.Ac(20);}else g=L.Qc(a,c,0),d=!0;if(!g)throw new L.Ac(44);8192===
    (g.mode&61440)&&(b&=-513);if(b&65536&&!P(g.mode))throw new L.Ac(54);if(!d&&(c=g?40960===(g.mode&61440)?32:P(g.mode)&&("r"!==ib(b)||b&512)?31:R(g,ib(b)):44))throw new L.Ac(c);b&512&&!d&&L.truncate(g,0);b&=-131713;g=mb({node:g,path:T(g),flags:b,seekable:!0,position:0,Cc:g.Cc,Zd:[],error:!1});g.Cc.open&&g.Cc.open(g);!e.logReadFiles||b&1||(L.pd||(L.pd={}),a in L.pd||(L.pd[a]=1));return g},close(a){if(null===a.fd)throw new L.Ac(8);a.jd&&(a.jd=null);try{a.Cc.close&&a.Cc.close(a);}catch(b){throw b;}finally{L.streams[a.fd]=
    null;}a.fd=null;},Lc(a,b,c){if(null===a.fd)throw new L.Ac(8);if(!a.seekable||!a.Cc.Lc)throw new L.Ac(70);if(0!=c&&1!=c&&2!=c)throw new L.Ac(28);a.position=a.Cc.Lc(a,b,c);a.Zd=[];return a.position},read(a,b,c,d,g){if(0>d||0>g)throw new L.Ac(28);if(null===a.fd)throw new L.Ac(8);if(1===(a.flags&2097155))throw new L.Ac(8);if(P(a.node.mode))throw new L.Ac(31);if(!a.Cc.read)throw new L.Ac(28);var h="undefined"!=typeof g;if(!h)g=a.position;else if(!a.seekable)throw new L.Ac(70);b=a.Cc.read(a,b,c,d,g);h||(a.position+=
    b);return b},write(a,b,c,d,g,h){if(0>d||0>g)throw new L.Ac(28);if(null===a.fd)throw new L.Ac(8);if(0===(a.flags&2097155))throw new L.Ac(8);if(P(a.node.mode))throw new L.Ac(31);if(!a.Cc.write)throw new L.Ac(28);a.seekable&&a.flags&1024&&L.Lc(a,0,2);var m="undefined"!=typeof g;if(!m)g=a.position;else if(!a.seekable)throw new L.Ac(70);b=a.Cc.write(a,b,c,d,g,h);m||(a.position+=b);return b},Yc(a,b,c){if(null===a.fd)throw new L.Ac(8);if(0>b||0>=c)throw new L.Ac(28);if(0===(a.flags&2097155))throw new L.Ac(8);
    if(!L.isFile(a.node.mode)&&!P(a.node.mode))throw new L.Ac(43);if(!a.Cc.Yc)throw new L.Ac(138);a.Cc.Yc(a,b,c);},Xc(a,b,c,d,g){if(0!==(d&2)&&0===(g&2)&&2!==(a.flags&2097155))throw new L.Ac(2);if(1===(a.flags&2097155))throw new L.Ac(2);if(!a.Cc.Xc)throw new L.Ac(43);return a.Cc.Xc(a,b,c,d,g)},ad(a,b,c,d,g){return a.Cc.ad?a.Cc.ad(a,b,c,d,g):0},ne:()=>0,ld(a,b,c){if(!a.Cc.ld)throw new L.Ac(59);return a.Cc.ld(a,b,c)},readFile(a,b={}){b.flags=b.flags||0;b.encoding=b.encoding||"binary";if("utf8"!==b.encoding&&
    "binary"!==b.encoding)throw Error(`Invalid encoding type "${b.encoding}"`);var c,d=L.open(a,b.flags);a=L.stat(a).size;var g=new Uint8Array(a);L.read(d,g,0,a,0);"utf8"===b.encoding?c=N(g,0):"binary"===b.encoding&&(c=g);L.close(d);return c},writeFile(a,b,c={}){c.flags=c.flags||577;a=L.open(a,c.flags,c.mode);if("string"==typeof b){var d=new Uint8Array(Sa(b)+1);b=Ta(b,d,0,d.length);L.write(a,d,0,b,void 0,c.Jd);}else if(ArrayBuffer.isView(b))L.write(a,b,0,b.byteLength,void 0,c.Jd);else throw Error("Unsupported data type");
    L.close(a);},cwd:()=>L.ud,chdir(a){a=S(a,{Jc:!0});if(null===a.node)throw new L.Ac(44);if(!P(a.node.mode))throw new L.Ac(54);var b=R(a.node,"x");if(b)throw new L.Ac(b);L.ud=a.path;},Zc(a,b,c){L.Zc.kd=!0;pb();e.stdin=a||e.stdin;e.stdout=b||e.stdout;e.stderr=c||e.stderr;e.stdin?L.Sc("/dev","stdin",e.stdin):L.symlink("/dev/tty","/dev/stdin");e.stdout?L.Sc("/dev","stdout",null,e.stdout):L.symlink("/dev/tty","/dev/stdout");e.stderr?L.Sc("/dev","stderr",null,e.stderr):L.symlink("/dev/tty1","/dev/stderr");
    L.open("/dev/stdin",0);L.open("/dev/stdout",1);L.open("/dev/stderr",1);},qe(){L.Zc.kd=!1;for(var a=0;a<L.streams.length;a++){var b=L.streams[a];b&&L.close(b);}},ie(a,b){try{var c=S(a,{Jc:!b});a=c.path;}catch(h){}var d=!1,g=null;try{c=S(a,{parent:!0}),J(a),c=S(a,{Jc:!b}),d=!0,g=c.node;}catch(h){}return d?g:null},ge(a,b){a="string"==typeof a?a:T(a);for(b=b.split("/").reverse();b.length;){var c=b.pop();if(c){var d=H(a+"/"+c);try{L.mkdir(d);}catch(g){}a=d;}}return d},Sc(a,b,c,d){a=La("string"==typeof a?a:T(a),
    b);b=eb(!!c,!!d);L.Sc.nd||(L.Sc.nd=64);var g=L.Tc(L.Sc.nd++,0);Xa(g,{open(h){h.seekable=!1;},close(){d&&d.buffer&&d.buffer.length&&d(10);},read(h,m,q,v){for(var r=0,n=0;n<v;n++){try{var w=c();}catch(D){throw new L.Ac(29);}if(void 0===w&&0===r)throw new L.Ac(6);if(null===w||void 0===w)break;r++;m[q+n]=w;}r&&(h.node.timestamp=Date.now());return r},write(h,m,q,v){for(var r=0;r<v;r++)try{d(m[q+r]);}catch(n){throw new L.Ac(29);}v&&(h.node.timestamp=Date.now());return r}});return ob(a,b,g)},fe(a,b,c,d,g){function h(){this.md=
    !1;this.Pc=[];}h.prototype.get=function(n){if(!(n>this.length-1||0>n)){var w=n%this.chunkSize;return this.yd(n/this.chunkSize|0)[w]}};h.prototype.Dd=function(n){this.yd=n;};h.prototype.sd=function(){var n=new XMLHttpRequest;n.open("HEAD",c,!1);n.send(null);if(!(200<=n.status&&300>n.status||304===n.status))throw Error("Couldn't load "+c+". Status: "+n.status);var w=Number(n.getResponseHeader("Content-length")),D,l=(D=n.getResponseHeader("Accept-Ranges"))&&"bytes"===D;n=(D=n.getResponseHeader("Content-Encoding"))&&
    "gzip"===D;var u=1048576;l||(u=w);var t=this;t.Dd(z=>{var G=z*u,M=(z+1)*u-1;M=Math.min(M,w-1);if("undefined"==typeof t.Pc[z]){var Oa=t.Pc;if(G>M)throw Error("invalid range ("+G+", "+M+") or no bytes requested!");if(M>w-1)throw Error("only "+w+" bytes available! programmer error!");var I=new XMLHttpRequest;I.open("GET",c,!1);w!==u&&I.setRequestHeader("Range","bytes="+G+"-"+M);I.responseType="arraybuffer";I.overrideMimeType&&I.overrideMimeType("text/plain; charset=x-user-defined");I.send(null);if(!(200<=
    I.status&&300>I.status||304===I.status))throw Error("Couldn't load "+c+". Status: "+I.status);G=void 0!==I.response?new Uint8Array(I.response||[]):Ua(I.responseText||"",!0);Oa[z]=G;}if("undefined"==typeof t.Pc[z])throw Error("doXHR failed!");return t.Pc[z]});if(n||!w)u=w=1,u=w=this.yd(0).length,na("LazyFiles on gzip forces download of the whole file when length is accessed");this.Hd=w;this.Gd=u;this.md=!0;};if("undefined"!=typeof XMLHttpRequest){if(!f)throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
    var m=new h;Object.defineProperties(m,{length:{get:function(){this.md||this.sd();return this.Hd}},chunkSize:{get:function(){this.md||this.sd();return this.Gd}}});var q=void 0;}else q=c,m=void 0;var v=qb(a,b,d,g);m?v.Dc=m:q&&(v.Dc=null,v.url=q);Object.defineProperties(v,{Ec:{get:function(){return this.Dc.length}}});var r={};Object.keys(v.Cc).forEach(n=>{var w=v.Cc[n];r[n]=function(){rb(v);return w.apply(null,arguments)};});r.read=(n,w,D,l,u)=>{rb(v);n=n.node.Dc;if(u>=n.length)w=0;else {l=Math.min(n.length-
    u,l);if(n.slice)for(var t=0;t<l;t++)w[D+t]=n[u+t];else for(t=0;t<l;t++)w[D+t]=n.get(u+t);w=l;}return w};r.Xc=()=>{rb(v);x();throw new L.Ac(48);};v.Cc=r;return v}};function sb(a,b){if("/"===b.charAt(0))return b;a=-100===a?L.cwd():U(a).path;if(0==b.length)throw new L.Ac(44);return H(a+"/"+b)}var tb=void 0;function V(){var a=B[+tb>>2];tb+=4;return a}
    var ub=a=>0===a%4&&(0!==a%100||0===a%400),vb=[0,31,60,91,121,152,182,213,244,274,305,335],wb=[0,31,59,90,120,151,181,212,243,273,304,334],yb=a=>{var b=Sa(a)+1,c=xb(b);c&&Ta(a,A,c,b);return c},zb={},Bb=()=>{if(!Ab){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:da||"./this.program"},b;for(b in zb)void 0===zb[b]?delete a[b]:a[b]=zb[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);
    Ab=c;}return Ab},Ab,Cb=[31,29,31,30,31,30,31,31,30,31,30,31],Db=[31,28,31,30,31,30,31,31,30,31,30,31],W=[],X,Eb=a=>{var b=W[a];b||(a>=W.length&&(W.length=a+1),W[a]=b=X.get(a));return b},Y,Fb=[];function Gb(a,b,c,d){a||(a=this);this.parent=a;this.Fc=a.Fc;this.Ic=null;this.id=L.Td++;this.name=b;this.mode=c;this.Bc={};this.Cc={};this.rdev=d;}
    Object.defineProperties(Gb.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366;}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147;}},Sd:{get:function(){return P(this.mode)}},Rd:{get:function(){return 8192===(this.mode&61440)}}});L.Ed=Gb;
    L.he=(a,b,c,d,g,h,m,q,v,r)=>{function n(D){function l(u){r&&r();if(!q){var t=a,z=b;t&&(t="string"==typeof t?t:T(t),z=b?H(t+"/"+b):t);t=eb(d,g);z=L.create(z,t);if(u){if("string"==typeof u){for(var G=Array(u.length),M=0,Oa=u.length;M<Oa;++M)G[M]=u.charCodeAt(M);u=G;}L.chmod(z,t|146);G=L.open(z,577);L.write(G,u,0,u.length,0,v);L.close(G);L.chmod(z,t);}}h&&h();za();}db(D,w,l,()=>{m&&m();za();})||l(D);}var w=b?K(H(a+"/"+b)):a;E++;"string"==typeof c?bb(c,D=>n(D),m):n(c);};pb();L.Mc=Array(4096);L.Fc(O,{},"/");
    L.mkdir("/tmp");L.mkdir("/home");L.mkdir("/home/web_user");(function(){L.mkdir("/dev");Xa(L.Tc(1,3),{read:()=>0,write:(d,g,h,m)=>m});ob("/dev/null",L.Tc(1,3));Wa(L.Tc(5,0),Za);Wa(L.Tc(6,0),$a);ob("/dev/tty",L.Tc(5,0));ob("/dev/tty1",L.Tc(6,0));var a=new Uint8Array(1024),b=0,c=()=>{0===b&&(b=Na(a).byteLength);return a[--b]};L.Sc("/dev","random",c);L.Sc("/dev","urandom",c);L.mkdir("/dev/shm");L.mkdir("/dev/shm/tmp");})();
    (function(){L.mkdir("/proc");var a=L.mkdir("/proc/self");L.mkdir("/proc/self/fd");L.Fc({Fc(){var b=L.createNode(a,"fd",16895,73);b.Bc={lookup(c,d){var g=U(+d);c={parent:null,Fc:{Bd:"fake"},Bc:{readlink:()=>g.path}};return c.parent=c}};return b}},{},"/proc/self/fd");})();L.Md={MEMFS:O};
    var Kb={x:function(a,b){try{var c=U(a);if(c.fd===b)return -28;var d=L.wd(b);d&&L.close(d);return mb(c,b).fd}catch(g){if("undefined"==typeof L||"ErrnoError"!==g.name)throw g;return -g.Hc}},b:function(a,b,c){tb=c;try{var d=U(a);switch(b){case 0:var g=V();if(0>g)return -28;for(;L.streams[g];)g++;return mb(d,g).fd;case 1:case 2:return 0;case 3:return d.flags;case 4:return g=V(),d.flags|=g,0;case 5:return g=V(),qa[g+0>>1]=2,0;case 6:case 7:return 0;case 16:case 8:return -28;case 9:return B[Hb()>>2]=28,-1;
    default:return -28}}catch(h){if("undefined"==typeof L||"ErrnoError"!==h.name)throw h;return -h.Hc}},z:function(a,b,c){tb=c;try{var d=U(a);switch(b){case 21509:return d.tty?0:-59;case 21505:if(!d.tty)return -59;if(d.tty.Rc.Od){a=[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];var g=V();B[g>>2]=25856;B[g+4>>2]=5;B[g+8>>2]=191;B[g+12>>2]=35387;for(var h=0;32>h;h++)y[g+h+17>>0]=a[h]||0;}return 0;case 21510:case 21511:case 21512:return d.tty?0:-59;case 21506:case 21507:case 21508:if(!d.tty)return -59;
    if(d.tty.Rc.Pd)for(g=V(),a=[],h=0;32>h;h++)a.push(y[g+h+17>>0]);return 0;case 21519:if(!d.tty)return -59;g=V();return B[g>>2]=0;case 21520:return d.tty?-28:-59;case 21531:return g=V(),L.ld(d,b,g);case 21523:if(!d.tty)return -59;d.tty.Rc.Qd&&(h=[24,80],g=V(),qa[g>>1]=h[0],qa[g+2>>1]=h[1]);return 0;case 21524:return d.tty?0:-59;case 21515:return d.tty?0:-59;default:return -28}}catch(m){if("undefined"==typeof L||"ErrnoError"!==m.name)throw m;return -m.Hc}},d:function(a,b,c,d){tb=d;try{b=b?N(A,b):"";b=sb(a,
    b);var g=d?V():0;return L.open(b,c,g).fd}catch(h){if("undefined"==typeof L||"ErrnoError"!==h.name)throw h;return -h.Hc}},r:function(a,b,c,d){try{b=b?N(A,b):"";b=sb(a,b);if(0>=d)return -28;var g=L.readlink(b),h=Math.min(d,Sa(g)),m=y[c+h];Ta(g,A,c,d+1);y[c+h]=m;return h}catch(q){if("undefined"==typeof L||"ErrnoError"!==q.name)throw q;return -q.Hc}},t:function(a,b,c,d){try{return b=b?N(A,b):"",d=d?N(A,d):"",b=sb(a,b),d=sb(c,d),L.rename(b,d),0}catch(g){if("undefined"==typeof L||"ErrnoError"!==g.name)throw g;
    return -g.Hc}},u:function(a){try{return a=a?N(A,a):"",L.rmdir(a),0}catch(b){if("undefined"==typeof L||"ErrnoError"!==b.name)throw b;return -b.Hc}},e:function(a,b,c){try{return b=b?N(A,b):"",b=sb(a,b),0===c?L.unlink(b):512===c?L.rmdir(b):x("Invalid flags passed to unlinkat"),0}catch(d){if("undefined"==typeof L||"ErrnoError"!==d.name)throw d;return -d.Hc}},g:()=>!0,o:()=>{throw Infinity;},k:function(a,b,c){a=new Date(1E3*(b+2097152>>>0<4194305-!!a?(a>>>0)+4294967296*b:NaN));B[c>>2]=a.getUTCSeconds();B[c+
    4>>2]=a.getUTCMinutes();B[c+8>>2]=a.getUTCHours();B[c+12>>2]=a.getUTCDate();B[c+16>>2]=a.getUTCMonth();B[c+20>>2]=a.getUTCFullYear()-1900;B[c+24>>2]=a.getUTCDay();B[c+28>>2]=(a.getTime()-Date.UTC(a.getUTCFullYear(),0,1,0,0,0,0))/864E5|0;},l:function(a,b,c){a=new Date(1E3*(b+2097152>>>0<4194305-!!a?(a>>>0)+4294967296*b:NaN));B[c>>2]=a.getSeconds();B[c+4>>2]=a.getMinutes();B[c+8>>2]=a.getHours();B[c+12>>2]=a.getDate();B[c+16>>2]=a.getMonth();B[c+20>>2]=a.getFullYear()-1900;B[c+24>>2]=a.getDay();B[c+
    28>>2]=(ub(a.getFullYear())?vb:wb)[a.getMonth()]+a.getDate()-1|0;B[c+36>>2]=-(60*a.getTimezoneOffset());b=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();var d=(new Date(a.getFullYear(),0,1)).getTimezoneOffset();B[c+32>>2]=(b!=d&&a.getTimezoneOffset()==Math.min(d,b))|0;},m:function(a){var b=new Date(B[a+20>>2]+1900,B[a+16>>2],B[a+12>>2],B[a+8>>2],B[a+4>>2],B[a>>2],0),c=B[a+32>>2],d=b.getTimezoneOffset(),g=(new Date(b.getFullYear(),6,1)).getTimezoneOffset(),h=(new Date(b.getFullYear(),0,1)).getTimezoneOffset(),
    m=Math.min(h,g);0>c?B[a+32>>2]=Number(g!=h&&m==d):0<c!=(m==d)&&(g=Math.max(h,g),b.setTime(b.getTime()+6E4*((0<c?m:g)-d)));B[a+24>>2]=b.getDay();B[a+28>>2]=(ub(b.getFullYear())?vb:wb)[b.getMonth()]+b.getDate()-1|0;B[a>>2]=b.getSeconds();B[a+4>>2]=b.getMinutes();B[a+8>>2]=b.getHours();B[a+12>>2]=b.getDate();B[a+16>>2]=b.getMonth();B[a+20>>2]=b.getYear();a=b.getTime()/1E3;return Ib((F=a,1<=+Math.abs(F)?0<F?+Math.floor(F/4294967296)>>>0:~~+Math.ceil((F-+(~~F>>>0))/4294967296)>>>0:0)),a>>>0},q:(a,b,c)=>
    {function d(v){return (v=v.toTimeString().match(/\(([A-Za-z ]+)\)$/))?v[1]:"GMT"}var g=(new Date).getFullYear(),h=new Date(g,0,1),m=new Date(g,6,1);g=h.getTimezoneOffset();var q=m.getTimezoneOffset();C[a>>2]=60*Math.max(g,q);B[b>>2]=Number(g!=q);a=d(h);b=d(m);a=yb(a);b=yb(b);q<g?(C[c>>2]=a,C[c+4>>2]=b):(C[c>>2]=b,C[c+4>>2]=a);},B:()=>{x("");},a:()=>Date.now(),h:(a,b,c)=>A.copyWithin(a,b,b+c),p:a=>{var b=A.length;a>>>=0;if(2147483648<a)return !1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);
    var g=Math;d=Math.max(a,d);a:{g=(g.min.call(g,2147483648,d+(65536-d%65536)%65536)-oa.buffer.byteLength+65535)/65536;try{oa.grow(g);ta();var h=1;break a}catch(m){}h=void 0;}if(h)return !0}return !1},v:(a,b)=>{var c=0;Bb().forEach((d,g)=>{var h=b+c;g=C[a+4*g>>2]=h;for(h=0;h<d.length;++h)y[g++>>0]=d.charCodeAt(h);y[g>>0]=0;c+=d.length+1;});return 0},w:(a,b)=>{var c=Bb();C[a>>2]=c.length;var d=0;c.forEach(g=>d+=g.length+1);C[b>>2]=d;return 0},i:a=>{pa=!0;ea(a,new Ia(a));},c:function(a){try{var b=U(a);L.close(b);
    return 0}catch(c){if("undefined"==typeof L||"ErrnoError"!==c.name)throw c;return c.Hc}},y:function(a,b,c,d){try{a:{var g=U(a);a=b;for(var h,m=b=0;m<c;m++){var q=C[a>>2],v=C[a+4>>2];a+=8;var r=L.read(g,y,q,v,h);if(0>r){var n=-1;break a}b+=r;if(r<v)break;"undefined"!==typeof h&&(h+=r);}n=b;}C[d>>2]=n;return 0}catch(w){if("undefined"==typeof L||"ErrnoError"!==w.name)throw w;return w.Hc}},n:function(a,b,c,d,g){b=c+2097152>>>0<4194305-!!b?(b>>>0)+4294967296*c:NaN;try{if(isNaN(b))return 61;var h=U(a);L.Lc(h,
    b,d);Ha=[h.position>>>0,(F=h.position,1<=+Math.abs(F)?0<F?+Math.floor(F/4294967296)>>>0:~~+Math.ceil((F-+(~~F>>>0))/4294967296)>>>0:0)];B[g>>2]=Ha[0];B[g+4>>2]=Ha[1];h.jd&&0===b&&0===d&&(h.jd=null);return 0}catch(m){if("undefined"==typeof L||"ErrnoError"!==m.name)throw m;return m.Hc}},f:function(a,b,c,d){try{a:{var g=U(a);a=b;for(var h,m=b=0;m<c;m++){var q=C[a>>2],v=C[a+4>>2];a+=8;var r=L.write(g,y,q,v,h);if(0>r){var n=-1;break a}b+=r;"undefined"!==typeof h&&(h+=r);}n=b;}C[d>>2]=n;return 0}catch(w){if("undefined"==
    typeof L||"ErrnoError"!==w.name)throw w;return w.Hc}},A:Jb,s:(a,b,c,d)=>{function g(l,u,t){for(l="number"==typeof l?l.toString():l||"";l.length<u;)l=t[0]+l;return l}function h(l,u){return g(l,u,"0")}function m(l,u){function t(G){return 0>G?-1:0<G?1:0}var z;0===(z=t(l.getFullYear()-u.getFullYear()))&&0===(z=t(l.getMonth()-u.getMonth()))&&(z=t(l.getDate()-u.getDate()));return z}function q(l){switch(l.getDay()){case 0:return new Date(l.getFullYear()-1,11,29);case 1:return l;case 2:return new Date(l.getFullYear(),
    0,3);case 3:return new Date(l.getFullYear(),0,2);case 4:return new Date(l.getFullYear(),0,1);case 5:return new Date(l.getFullYear()-1,11,31);case 6:return new Date(l.getFullYear()-1,11,30)}}function v(l){var u=l.Vc;for(l=new Date((new Date(l.Wc+1900,0,1)).getTime());0<u;){var t=l.getMonth(),z=(ub(l.getFullYear())?Cb:Db)[t];if(u>z-l.getDate())u-=z-l.getDate()+1,l.setDate(1),11>t?l.setMonth(t+1):(l.setMonth(0),l.setFullYear(l.getFullYear()+1));else {l.setDate(l.getDate()+u);break}}t=new Date(l.getFullYear()+
    1,0,4);u=q(new Date(l.getFullYear(),0,4));t=q(t);return 0>=m(u,l)?0>=m(t,l)?l.getFullYear()+1:l.getFullYear():l.getFullYear()-1}var r=C[d+40>>2];d={Xd:B[d>>2],Wd:B[d+4>>2],dd:B[d+8>>2],rd:B[d+12>>2],ed:B[d+16>>2],Wc:B[d+20>>2],Oc:B[d+24>>2],Vc:B[d+28>>2],te:B[d+32>>2],Vd:B[d+36>>2],Yd:r?r?N(A,r):"":""};c=c?N(A,c):"";r={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y",
    "%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var n in r)c=c.replace(new RegExp(n,"g"),r[n]);var w="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),D="January February March April May June July August September October November December".split(" ");r={"%a":l=>w[l.Oc].substring(0,3),"%A":l=>w[l.Oc],"%b":l=>D[l.ed].substring(0,3),"%B":l=>D[l.ed],
    "%C":l=>h((l.Wc+1900)/100|0,2),"%d":l=>h(l.rd,2),"%e":l=>g(l.rd,2," "),"%g":l=>v(l).toString().substring(2),"%G":l=>v(l),"%H":l=>h(l.dd,2),"%I":l=>{l=l.dd;0==l?l=12:12<l&&(l-=12);return h(l,2)},"%j":l=>{for(var u=0,t=0;t<=l.ed-1;u+=(ub(l.Wc+1900)?Cb:Db)[t++]);return h(l.rd+u,3)},"%m":l=>h(l.ed+1,2),"%M":l=>h(l.Wd,2),"%n":()=>"\n","%p":l=>0<=l.dd&&12>l.dd?"AM":"PM","%S":l=>h(l.Xd,2),"%t":()=>"\t","%u":l=>l.Oc||7,"%U":l=>h(Math.floor((l.Vc+7-l.Oc)/7),2),"%V":l=>{var u=Math.floor((l.Vc+7-(l.Oc+6)%7)/
    7);2>=(l.Oc+371-l.Vc-2)%7&&u++;if(u)53==u&&(t=(l.Oc+371-l.Vc)%7,4==t||3==t&&ub(l.Wc)||(u=1));else {u=52;var t=(l.Oc+7-l.Vc-1)%7;(4==t||5==t&&ub(l.Wc%400-1))&&u++;}return h(u,2)},"%w":l=>l.Oc,"%W":l=>h(Math.floor((l.Vc+7-(l.Oc+6)%7)/7),2),"%y":l=>(l.Wc+1900).toString().substring(2),"%Y":l=>l.Wc+1900,"%z":l=>{l=l.Vd;var u=0<=l;l=Math.abs(l)/60;return (u?"+":"-")+String("0000"+(l/60*100+l%60)).slice(-4)},"%Z":l=>l.Yd,"%%":()=>"%"};c=c.replace(/%%/g,"\x00\x00");for(n in r)c.includes(n)&&(c=c.replace(new RegExp(n,
    "g"),r[n](d)));c=c.replace(/\0\0/g,"%");n=Ua(c,!1);if(n.length>b)return 0;y.set(n,a);return n.length-1},j:a=>{if(ha){if(!a)return 1;a=a?N(A,a):"";if(!a.length)return 0;a=require$1("child_process").se(a,[],{re:!0,stdio:"inherit"});var b=(c,d)=>c<<8|d;return null===a.status?b(0,(c=>{switch(c){case "SIGHUP":return 1;case "SIGQUIT":return 3;case "SIGFPE":return 8;case "SIGKILL":return 9;case "SIGALRM":return 14;case "SIGTERM":return 15}return 2})(a.signal)):a.status<<8|0}if(!a)return 0;B[Hb()>>2]=52;return -1}},
    Z=function(){var a={a:Kb};E++;Ga(a,function(b){Z=b.instance.exports;oa=Z.C;ta();X=Z.ab;va.unshift(Z.D);za();}).catch(ba);return {}}();e._lua_checkstack=(a,b)=>(e._lua_checkstack=Z.E)(a,b);e._lua_xmove=(a,b,c)=>(e._lua_xmove=Z.F)(a,b,c);e._lua_atpanic=(a,b)=>(e._lua_atpanic=Z.G)(a,b);e._lua_version=a=>(e._lua_version=Z.H)(a);e._lua_absindex=(a,b)=>(e._lua_absindex=Z.I)(a,b);e._lua_gettop=a=>(e._lua_gettop=Z.J)(a);e._lua_settop=(a,b)=>(e._lua_settop=Z.K)(a,b);
    e._lua_closeslot=(a,b)=>(e._lua_closeslot=Z.L)(a,b);e._lua_rotate=(a,b,c)=>(e._lua_rotate=Z.M)(a,b,c);e._lua_copy=(a,b,c)=>(e._lua_copy=Z.N)(a,b,c);e._lua_pushvalue=(a,b)=>(e._lua_pushvalue=Z.O)(a,b);e._lua_type=(a,b)=>(e._lua_type=Z.P)(a,b);e._lua_typename=(a,b)=>(e._lua_typename=Z.Q)(a,b);e._lua_iscfunction=(a,b)=>(e._lua_iscfunction=Z.R)(a,b);e._lua_isinteger=(a,b)=>(e._lua_isinteger=Z.S)(a,b);e._lua_isnumber=(a,b)=>(e._lua_isnumber=Z.T)(a,b);e._lua_isstring=(a,b)=>(e._lua_isstring=Z.U)(a,b);
    e._lua_isuserdata=(a,b)=>(e._lua_isuserdata=Z.V)(a,b);e._lua_rawequal=(a,b,c)=>(e._lua_rawequal=Z.W)(a,b,c);e._lua_arith=(a,b)=>(e._lua_arith=Z.X)(a,b);e._lua_compare=(a,b,c,d)=>(e._lua_compare=Z.Y)(a,b,c,d);e._lua_stringtonumber=(a,b)=>(e._lua_stringtonumber=Z.Z)(a,b);e._lua_tonumberx=(a,b,c)=>(e._lua_tonumberx=Z._)(a,b,c);e._lua_tointegerx=(a,b,c)=>(e._lua_tointegerx=Z.$)(a,b,c);e._lua_toboolean=(a,b)=>(e._lua_toboolean=Z.aa)(a,b);e._lua_tolstring=(a,b,c)=>(e._lua_tolstring=Z.ba)(a,b,c);
    e._lua_rawlen=(a,b)=>(e._lua_rawlen=Z.ca)(a,b);e._lua_tocfunction=(a,b)=>(e._lua_tocfunction=Z.da)(a,b);e._lua_touserdata=(a,b)=>(e._lua_touserdata=Z.ea)(a,b);e._lua_tothread=(a,b)=>(e._lua_tothread=Z.fa)(a,b);e._lua_topointer=(a,b)=>(e._lua_topointer=Z.ga)(a,b);e._lua_pushnil=a=>(e._lua_pushnil=Z.ha)(a);e._lua_pushnumber=(a,b)=>(e._lua_pushnumber=Z.ia)(a,b);e._lua_pushinteger=(a,b)=>(e._lua_pushinteger=Z.ja)(a,b);e._lua_pushlstring=(a,b,c)=>(e._lua_pushlstring=Z.ka)(a,b,c);
    e._lua_pushstring=(a,b)=>(e._lua_pushstring=Z.la)(a,b);e._lua_pushcclosure=(a,b,c)=>(e._lua_pushcclosure=Z.ma)(a,b,c);e._lua_pushboolean=(a,b)=>(e._lua_pushboolean=Z.na)(a,b);e._lua_pushlightuserdata=(a,b)=>(e._lua_pushlightuserdata=Z.oa)(a,b);e._lua_pushthread=a=>(e._lua_pushthread=Z.pa)(a);e._lua_getglobal=(a,b)=>(e._lua_getglobal=Z.qa)(a,b);e._lua_gettable=(a,b)=>(e._lua_gettable=Z.ra)(a,b);e._lua_getfield=(a,b,c)=>(e._lua_getfield=Z.sa)(a,b,c);e._lua_geti=(a,b,c)=>(e._lua_geti=Z.ta)(a,b,c);
    e._lua_rawget=(a,b)=>(e._lua_rawget=Z.ua)(a,b);e._lua_rawgeti=(a,b,c)=>(e._lua_rawgeti=Z.va)(a,b,c);e._lua_rawgetp=(a,b,c)=>(e._lua_rawgetp=Z.wa)(a,b,c);e._lua_createtable=(a,b,c)=>(e._lua_createtable=Z.xa)(a,b,c);e._lua_getmetatable=(a,b)=>(e._lua_getmetatable=Z.ya)(a,b);e._lua_getiuservalue=(a,b,c)=>(e._lua_getiuservalue=Z.za)(a,b,c);e._lua_setglobal=(a,b)=>(e._lua_setglobal=Z.Aa)(a,b);e._lua_settable=(a,b)=>(e._lua_settable=Z.Ba)(a,b);e._lua_setfield=(a,b,c)=>(e._lua_setfield=Z.Ca)(a,b,c);
    e._lua_seti=(a,b,c)=>(e._lua_seti=Z.Da)(a,b,c);e._lua_rawset=(a,b)=>(e._lua_rawset=Z.Ea)(a,b);e._lua_rawsetp=(a,b,c)=>(e._lua_rawsetp=Z.Fa)(a,b,c);e._lua_rawseti=(a,b,c)=>(e._lua_rawseti=Z.Ga)(a,b,c);e._lua_setmetatable=(a,b)=>(e._lua_setmetatable=Z.Ha)(a,b);e._lua_setiuservalue=(a,b,c)=>(e._lua_setiuservalue=Z.Ia)(a,b,c);e._lua_callk=(a,b,c,d,g)=>(e._lua_callk=Z.Ja)(a,b,c,d,g);e._lua_pcallk=(a,b,c,d,g,h)=>(e._lua_pcallk=Z.Ka)(a,b,c,d,g,h);e._lua_load=(a,b,c,d,g)=>(e._lua_load=Z.La)(a,b,c,d,g);
    e._lua_dump=(a,b,c,d)=>(e._lua_dump=Z.Ma)(a,b,c,d);e._lua_status=a=>(e._lua_status=Z.Na)(a);e._lua_error=a=>(e._lua_error=Z.Oa)(a);e._lua_next=(a,b)=>(e._lua_next=Z.Pa)(a,b);e._lua_toclose=(a,b)=>(e._lua_toclose=Z.Qa)(a,b);e._lua_concat=(a,b)=>(e._lua_concat=Z.Ra)(a,b);e._lua_len=(a,b)=>(e._lua_len=Z.Sa)(a,b);e._lua_getallocf=(a,b)=>(e._lua_getallocf=Z.Ta)(a,b);e._lua_setallocf=(a,b,c)=>(e._lua_setallocf=Z.Ua)(a,b,c);e._lua_setwarnf=(a,b,c)=>(e._lua_setwarnf=Z.Va)(a,b,c);
    e._lua_warning=(a,b,c)=>(e._lua_warning=Z.Wa)(a,b,c);e._lua_newuserdatauv=(a,b,c)=>(e._lua_newuserdatauv=Z.Xa)(a,b,c);e._lua_getupvalue=(a,b,c)=>(e._lua_getupvalue=Z.Ya)(a,b,c);e._lua_setupvalue=(a,b,c)=>(e._lua_setupvalue=Z.Za)(a,b,c);e._lua_upvalueid=(a,b,c)=>(e._lua_upvalueid=Z._a)(a,b,c);e._lua_upvaluejoin=(a,b,c,d,g)=>(e._lua_upvaluejoin=Z.$a)(a,b,c,d,g);e._luaL_traceback=(a,b,c,d)=>(e._luaL_traceback=Z.bb)(a,b,c,d);e._lua_getstack=(a,b,c)=>(e._lua_getstack=Z.cb)(a,b,c);
    e._lua_getinfo=(a,b,c)=>(e._lua_getinfo=Z.db)(a,b,c);e._luaL_buffinit=(a,b)=>(e._luaL_buffinit=Z.eb)(a,b);e._luaL_addstring=(a,b)=>(e._luaL_addstring=Z.fb)(a,b);e._luaL_prepbuffsize=(a,b)=>(e._luaL_prepbuffsize=Z.gb)(a,b);e._luaL_addvalue=a=>(e._luaL_addvalue=Z.hb)(a);e._luaL_pushresult=a=>(e._luaL_pushresult=Z.ib)(a);e._luaL_argerror=(a,b,c)=>(e._luaL_argerror=Z.jb)(a,b,c);e._luaL_typeerror=(a,b,c)=>(e._luaL_typeerror=Z.kb)(a,b,c);e._luaL_getmetafield=(a,b,c)=>(e._luaL_getmetafield=Z.lb)(a,b,c);
    e._luaL_where=(a,b)=>(e._luaL_where=Z.mb)(a,b);e._luaL_fileresult=(a,b,c)=>(e._luaL_fileresult=Z.nb)(a,b,c);var Hb=()=>(Hb=Z.ob)();e._luaL_execresult=(a,b)=>(e._luaL_execresult=Z.pb)(a,b);e._luaL_newmetatable=(a,b)=>(e._luaL_newmetatable=Z.qb)(a,b);e._luaL_setmetatable=(a,b)=>(e._luaL_setmetatable=Z.rb)(a,b);e._luaL_testudata=(a,b,c)=>(e._luaL_testudata=Z.sb)(a,b,c);e._luaL_checkudata=(a,b,c)=>(e._luaL_checkudata=Z.tb)(a,b,c);e._luaL_optlstring=(a,b,c,d)=>(e._luaL_optlstring=Z.ub)(a,b,c,d);
    e._luaL_checklstring=(a,b,c)=>(e._luaL_checklstring=Z.vb)(a,b,c);e._luaL_checkstack=(a,b,c)=>(e._luaL_checkstack=Z.wb)(a,b,c);e._luaL_checktype=(a,b,c)=>(e._luaL_checktype=Z.xb)(a,b,c);e._luaL_checkany=(a,b)=>(e._luaL_checkany=Z.yb)(a,b);e._luaL_checknumber=(a,b)=>(e._luaL_checknumber=Z.zb)(a,b);e._luaL_optnumber=(a,b,c)=>(e._luaL_optnumber=Z.Ab)(a,b,c);e._luaL_checkinteger=(a,b)=>(e._luaL_checkinteger=Z.Bb)(a,b);e._luaL_optinteger=(a,b,c)=>(e._luaL_optinteger=Z.Cb)(a,b,c);
    e._luaL_setfuncs=(a,b,c)=>(e._luaL_setfuncs=Z.Db)(a,b,c);e._luaL_addlstring=(a,b,c)=>(e._luaL_addlstring=Z.Eb)(a,b,c);e._luaL_pushresultsize=(a,b)=>(e._luaL_pushresultsize=Z.Fb)(a,b);e._luaL_buffinitsize=(a,b,c)=>(e._luaL_buffinitsize=Z.Gb)(a,b,c);e._luaL_ref=(a,b)=>(e._luaL_ref=Z.Hb)(a,b);e._luaL_unref=(a,b,c)=>(e._luaL_unref=Z.Ib)(a,b,c);e._luaL_loadfilex=(a,b,c)=>(e._luaL_loadfilex=Z.Jb)(a,b,c);e._luaL_loadbufferx=(a,b,c,d,g)=>(e._luaL_loadbufferx=Z.Kb)(a,b,c,d,g);
    e._luaL_loadstring=(a,b)=>(e._luaL_loadstring=Z.Lb)(a,b);e._luaL_callmeta=(a,b,c)=>(e._luaL_callmeta=Z.Mb)(a,b,c);e._luaL_len=(a,b)=>(e._luaL_len=Z.Nb)(a,b);e._luaL_tolstring=(a,b,c)=>(e._luaL_tolstring=Z.Ob)(a,b,c);e._luaL_getsubtable=(a,b,c)=>(e._luaL_getsubtable=Z.Pb)(a,b,c);e._luaL_requiref=(a,b,c,d)=>(e._luaL_requiref=Z.Qb)(a,b,c,d);e._luaL_addgsub=(a,b,c,d)=>(e._luaL_addgsub=Z.Rb)(a,b,c,d);e._luaL_gsub=(a,b,c,d)=>(e._luaL_gsub=Z.Sb)(a,b,c,d);e._luaL_newstate=()=>(e._luaL_newstate=Z.Tb)();
    e._lua_newstate=(a,b)=>(e._lua_newstate=Z.Ub)(a,b);e._free=a=>(e._free=Z.Vb)(a);e._realloc=(a,b)=>(e._realloc=Z.Wb)(a,b);e._luaL_checkversion_=(a,b,c)=>(e._luaL_checkversion_=Z.Xb)(a,b,c);e._luaopen_base=a=>(e._luaopen_base=Z.Yb)(a);e._luaopen_coroutine=a=>(e._luaopen_coroutine=Z.Zb)(a);e._lua_newthread=a=>(e._lua_newthread=Z._b)(a);e._lua_yieldk=(a,b,c,d)=>(e._lua_yieldk=Z.$b)(a,b,c,d);e._lua_isyieldable=a=>(e._lua_isyieldable=Z.ac)(a);e._lua_resetthread=(a,b)=>(e._lua_resetthread=Z.bc)(a,b);
    e._lua_resume=(a,b,c,d)=>(e._lua_resume=Z.cc)(a,b,c,d);e._luaopen_debug=a=>(e._luaopen_debug=Z.dc)(a);e._lua_gethookmask=a=>(e._lua_gethookmask=Z.ec)(a);e._lua_gethook=a=>(e._lua_gethook=Z.fc)(a);e._lua_gethookcount=a=>(e._lua_gethookcount=Z.gc)(a);e._lua_getlocal=(a,b,c)=>(e._lua_getlocal=Z.hc)(a,b,c);e._lua_sethook=(a,b,c,d)=>(e._lua_sethook=Z.ic)(a,b,c,d);e._lua_setlocal=(a,b,c)=>(e._lua_setlocal=Z.jc)(a,b,c);e._lua_setcstacklimit=(a,b)=>(e._lua_setcstacklimit=Z.kc)(a,b);
    var xb=e._malloc=a=>(xb=e._malloc=Z.lc)(a),Ib=a=>(Ib=Z.mc)(a);e._luaL_openlibs=a=>(e._luaL_openlibs=Z.nc)(a);e._luaopen_package=a=>(e._luaopen_package=Z.oc)(a);e._luaopen_table=a=>(e._luaopen_table=Z.pc)(a);e._luaopen_io=a=>(e._luaopen_io=Z.qc)(a);e._luaopen_os=a=>(e._luaopen_os=Z.rc)(a);e._luaopen_string=a=>(e._luaopen_string=Z.sc)(a);e._luaopen_math=a=>(e._luaopen_math=Z.tc)(a);e._luaopen_utf8=a=>(e._luaopen_utf8=Z.uc)(a);e._lua_close=a=>(e._lua_close=Z.vc)(a);
    var Lb=(a,b)=>(Lb=Z.wc)(a,b),Mb=()=>(Mb=Z.xc)(),Nb=a=>(Nb=Z.yc)(a),Ob=a=>(Ob=Z.zc)(a);function Jb(a,b,c){var d=Mb();try{Eb(a)(b,c);}catch(g){Nb(d);if(g!==g+0)throw g;Lb(1,0);}}e.ENV=zb;
    e.ccall=(a,b,c,d)=>{var g={string:r=>{var n=0;if(null!==r&&void 0!==r&&0!==r){n=Sa(r)+1;var w=Ob(n);Ta(r,A,w,n);n=w;}return n},array:r=>{var n=Ob(r.length);y.set(r,n);return n}};a=e["_"+a];var h=[],m=0;if(d)for(var q=0;q<d.length;q++){var v=g[c[q]];v?(0===m&&(m=Mb()),h[q]=v(d[q])):h[q]=d[q];}c=a.apply(null,h);return c=function(r){0!==m&&Nb(m);return "string"===b?r?N(A,r):"":"boolean"===b?!!r:r}(c)};
    e.addFunction=(a,b)=>{if(!Y){Y=new WeakMap;var c=X.length;if(Y)for(var d=0;d<0+c;d++){var g=Eb(d);g&&Y.set(g,d);}}if(c=Y.get(a)||0)return c;if(Fb.length)c=Fb.pop();else {try{X.grow(1);}catch(q){if(!(q instanceof RangeError))throw q;throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=X.length-1;}try{d=c,X.set(d,a),W[d]=X.get(d);}catch(q){if(!(q instanceof TypeError))throw q;if("function"==typeof WebAssembly.Function){d=WebAssembly.Function;g={i:"i32",j:"i64",f:"f32",d:"f64",e:"externref",p:"i32"};
    for(var h={parameters:[],results:"v"==b[0]?[]:[g[b[0]]]},m=1;m<b.length;++m)h.parameters.push(g[b[m]]);b=new d(h,a);}else {d=[1];g=b.slice(0,1);b=b.slice(1);h={i:127,p:127,j:126,f:125,d:124,e:111};d.push(96);m=b.length;128>m?d.push(m):d.push(m%128|128,m>>7);for(m=0;m<b.length;++m)d.push(h[b[m]]);"v"==g?d.push(0):d.push(1,h[g]);b=[0,97,115,109,1,0,0,0,1];g=d.length;128>g?b.push(g):b.push(g%128|128,g>>7);b.push.apply(b,d);b.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);b=new WebAssembly.Module(new Uint8Array(b));
    b=(new WebAssembly.Instance(b,{e:{f:a}})).exports.f;}d=c;X.set(d,b);W[d]=X.get(d);}Y.set(a,c);return c};e.removeFunction=a=>{Y.delete(Eb(a));X.set(a,null);W[a]=X.get(a);Fb.push(a);};e.setValue=function(a,b,c="i8"){c.endsWith("*")&&(c="*");switch(c){case "i1":y[a>>0]=b;break;case "i8":y[a>>0]=b;break;case "i16":qa[a>>1]=b;break;case "i32":B[a>>2]=b;break;case "i64":x("to do setValue(i64) use WASM_BIGINT");case "float":ra[a>>2]=b;break;case "double":sa[a>>3]=b;break;case "*":C[a>>2]=b;break;default:x(`invalid type for setValue: ${c}`);}};
    e.getValue=function(a,b="i8"){b.endsWith("*")&&(b="*");switch(b){case "i1":return y[a>>0];case "i8":return y[a>>0];case "i16":return qa[a>>1];case "i32":return B[a>>2];case "i64":x("to do getValue(i64) use WASM_BIGINT");case "float":return ra[a>>2];case "double":return sa[a>>3];case "*":return C[a>>2];default:x(`invalid type for getValue: ${b}`);}};e.stringToUTF8=(a,b,c)=>Ta(a,A,b,c);e.lengthBytesUTF8=Sa;e.stringToNewUTF8=yb;e.FS=L;var Pb;ya=function Qb(){Pb||Rb();Pb||(ya=Qb);};
    function Rb(){if(!(0<E)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;){var a=e.preRun.shift();ua.unshift(a);}for(;0<ua.length;)ua.shift()(e);if(!(0<E||Pb||(Pb=!0,e.calledRun=!0,pa))){e.noFSInit||L.Zc.kd||L.Zc();for(L.zd=!1;0<va.length;)va.shift()(e);for(aa(e);0<wa.length;)wa.shift()(e);}}}Rb();


      return moduleArg.ready
    }

    );
    })();

    class LuaWasm {
        static async initialize(customWasmFileLocation, environmentVariables) {
            const module = await initWasmModule({
                print: console.log,
                printErr: console.error,
                locateFile: (path, scriptDirectory) => {
                    return customWasmFileLocation || scriptDirectory + path;
                },
                preRun: (initializedModule) => {
                    if (typeof environmentVariables === 'object') {
                        Object.entries(environmentVariables).forEach(([k, v]) => (initializedModule.ENV[k] = v));
                    }
                },
            });
            return new LuaWasm(module);
        }
        constructor(module) {
            this.referenceTracker = new WeakMap();
            this.referenceMap = new Map();
            this.availableReferences = [];
            this.module = module;
            this.luaL_checkversion_ = this.cwrap('luaL_checkversion_', null, ['number', 'number', 'number']);
            this.luaL_getmetafield = this.cwrap('luaL_getmetafield', 'number', ['number', 'number', 'string']);
            this.luaL_callmeta = this.cwrap('luaL_callmeta', 'number', ['number', 'number', 'string']);
            this.luaL_tolstring = this.cwrap('luaL_tolstring', 'string', ['number', 'number', 'number']);
            this.luaL_argerror = this.cwrap('luaL_argerror', 'number', ['number', 'number', 'string']);
            this.luaL_typeerror = this.cwrap('luaL_typeerror', 'number', ['number', 'number', 'string']);
            this.luaL_checklstring = this.cwrap('luaL_checklstring', 'string', ['number', 'number', 'number']);
            this.luaL_optlstring = this.cwrap('luaL_optlstring', 'string', ['number', 'number', 'string', 'number']);
            this.luaL_checknumber = this.cwrap('luaL_checknumber', 'number', ['number', 'number']);
            this.luaL_optnumber = this.cwrap('luaL_optnumber', 'number', ['number', 'number', 'number']);
            this.luaL_checkinteger = this.cwrap('luaL_checkinteger', 'number', ['number', 'number']);
            this.luaL_optinteger = this.cwrap('luaL_optinteger', 'number', ['number', 'number', 'number']);
            this.luaL_checkstack = this.cwrap('luaL_checkstack', null, ['number', 'number', 'string']);
            this.luaL_checktype = this.cwrap('luaL_checktype', null, ['number', 'number', 'number']);
            this.luaL_checkany = this.cwrap('luaL_checkany', null, ['number', 'number']);
            this.luaL_newmetatable = this.cwrap('luaL_newmetatable', 'number', ['number', 'string']);
            this.luaL_setmetatable = this.cwrap('luaL_setmetatable', null, ['number', 'string']);
            this.luaL_testudata = this.cwrap('luaL_testudata', 'number', ['number', 'number', 'string']);
            this.luaL_checkudata = this.cwrap('luaL_checkudata', 'number', ['number', 'number', 'string']);
            this.luaL_where = this.cwrap('luaL_where', null, ['number', 'number']);
            this.luaL_fileresult = this.cwrap('luaL_fileresult', 'number', ['number', 'number', 'string']);
            this.luaL_execresult = this.cwrap('luaL_execresult', 'number', ['number', 'number']);
            this.luaL_ref = this.cwrap('luaL_ref', 'number', ['number', 'number']);
            this.luaL_unref = this.cwrap('luaL_unref', null, ['number', 'number', 'number']);
            this.luaL_loadfilex = this.cwrap('luaL_loadfilex', 'number', ['number', 'string', 'string']);
            this.luaL_loadbufferx = this.cwrap('luaL_loadbufferx', 'number', ['number', 'string|number', 'number', 'string|number', 'string']);
            this.luaL_loadstring = this.cwrap('luaL_loadstring', 'number', ['number', 'string']);
            this.luaL_newstate = this.cwrap('luaL_newstate', 'number', []);
            this.luaL_len = this.cwrap('luaL_len', 'number', ['number', 'number']);
            this.luaL_addgsub = this.cwrap('luaL_addgsub', null, ['number', 'string', 'string', 'string']);
            this.luaL_gsub = this.cwrap('luaL_gsub', 'string', ['number', 'string', 'string', 'string']);
            this.luaL_setfuncs = this.cwrap('luaL_setfuncs', null, ['number', 'number', 'number']);
            this.luaL_getsubtable = this.cwrap('luaL_getsubtable', 'number', ['number', 'number', 'string']);
            this.luaL_traceback = this.cwrap('luaL_traceback', null, ['number', 'number', 'string', 'number']);
            this.luaL_requiref = this.cwrap('luaL_requiref', null, ['number', 'string', 'number', 'number']);
            this.luaL_buffinit = this.cwrap('luaL_buffinit', null, ['number', 'number']);
            this.luaL_prepbuffsize = this.cwrap('luaL_prepbuffsize', 'string', ['number', 'number']);
            this.luaL_addlstring = this.cwrap('luaL_addlstring', null, ['number', 'string', 'number']);
            this.luaL_addstring = this.cwrap('luaL_addstring', null, ['number', 'string']);
            this.luaL_addvalue = this.cwrap('luaL_addvalue', null, ['number']);
            this.luaL_pushresult = this.cwrap('luaL_pushresult', null, ['number']);
            this.luaL_pushresultsize = this.cwrap('luaL_pushresultsize', null, ['number', 'number']);
            this.luaL_buffinitsize = this.cwrap('luaL_buffinitsize', 'string', ['number', 'number', 'number']);
            this.lua_newstate = this.cwrap('lua_newstate', 'number', ['number', 'number']);
            this.lua_close = this.cwrap('lua_close', null, ['number']);
            this.lua_newthread = this.cwrap('lua_newthread', 'number', ['number']);
            this.lua_resetthread = this.cwrap('lua_resetthread', 'number', ['number']);
            this.lua_atpanic = this.cwrap('lua_atpanic', 'number', ['number', 'number']);
            this.lua_version = this.cwrap('lua_version', 'number', ['number']);
            this.lua_absindex = this.cwrap('lua_absindex', 'number', ['number', 'number']);
            this.lua_gettop = this.cwrap('lua_gettop', 'number', ['number']);
            this.lua_settop = this.cwrap('lua_settop', null, ['number', 'number']);
            this.lua_pushvalue = this.cwrap('lua_pushvalue', null, ['number', 'number']);
            this.lua_rotate = this.cwrap('lua_rotate', null, ['number', 'number', 'number']);
            this.lua_copy = this.cwrap('lua_copy', null, ['number', 'number', 'number']);
            this.lua_checkstack = this.cwrap('lua_checkstack', 'number', ['number', 'number']);
            this.lua_xmove = this.cwrap('lua_xmove', null, ['number', 'number', 'number']);
            this.lua_isnumber = this.cwrap('lua_isnumber', 'number', ['number', 'number']);
            this.lua_isstring = this.cwrap('lua_isstring', 'number', ['number', 'number']);
            this.lua_iscfunction = this.cwrap('lua_iscfunction', 'number', ['number', 'number']);
            this.lua_isinteger = this.cwrap('lua_isinteger', 'number', ['number', 'number']);
            this.lua_isuserdata = this.cwrap('lua_isuserdata', 'number', ['number', 'number']);
            this.lua_type = this.cwrap('lua_type', 'number', ['number', 'number']);
            this.lua_typename = this.cwrap('lua_typename', 'string', ['number', 'number']);
            this.lua_tonumberx = this.cwrap('lua_tonumberx', 'number', ['number', 'number', 'number']);
            this.lua_tointegerx = this.cwrap('lua_tointegerx', 'number', ['number', 'number', 'number']);
            this.lua_toboolean = this.cwrap('lua_toboolean', 'number', ['number', 'number']);
            this.lua_tolstring = this.cwrap('lua_tolstring', 'string', ['number', 'number', 'number']);
            this.lua_rawlen = this.cwrap('lua_rawlen', 'number', ['number', 'number']);
            this.lua_tocfunction = this.cwrap('lua_tocfunction', 'number', ['number', 'number']);
            this.lua_touserdata = this.cwrap('lua_touserdata', 'number', ['number', 'number']);
            this.lua_tothread = this.cwrap('lua_tothread', 'number', ['number', 'number']);
            this.lua_topointer = this.cwrap('lua_topointer', 'number', ['number', 'number']);
            this.lua_arith = this.cwrap('lua_arith', null, ['number', 'number']);
            this.lua_rawequal = this.cwrap('lua_rawequal', 'number', ['number', 'number', 'number']);
            this.lua_compare = this.cwrap('lua_compare', 'number', ['number', 'number', 'number', 'number']);
            this.lua_pushnil = this.cwrap('lua_pushnil', null, ['number']);
            this.lua_pushnumber = this.cwrap('lua_pushnumber', null, ['number', 'number']);
            this.lua_pushinteger = this.cwrap('lua_pushinteger', null, ['number', 'number']);
            this.lua_pushlstring = this.cwrap('lua_pushlstring', 'string', ['number', 'string|number', 'number']);
            this.lua_pushstring = this.cwrap('lua_pushstring', 'string', ['number', 'string|number']);
            this.lua_pushcclosure = this.cwrap('lua_pushcclosure', null, ['number', 'number', 'number']);
            this.lua_pushboolean = this.cwrap('lua_pushboolean', null, ['number', 'number']);
            this.lua_pushlightuserdata = this.cwrap('lua_pushlightuserdata', null, ['number', 'number']);
            this.lua_pushthread = this.cwrap('lua_pushthread', 'number', ['number']);
            this.lua_getglobal = this.cwrap('lua_getglobal', 'number', ['number', 'string']);
            this.lua_gettable = this.cwrap('lua_gettable', 'number', ['number', 'number']);
            this.lua_getfield = this.cwrap('lua_getfield', 'number', ['number', 'number', 'string']);
            this.lua_geti = this.cwrap('lua_geti', 'number', ['number', 'number', 'number']);
            this.lua_rawget = this.cwrap('lua_rawget', 'number', ['number', 'number']);
            this.lua_rawgeti = this.cwrap('lua_rawgeti', 'number', ['number', 'number', 'number']);
            this.lua_rawgetp = this.cwrap('lua_rawgetp', 'number', ['number', 'number', 'number']);
            this.lua_createtable = this.cwrap('lua_createtable', null, ['number', 'number', 'number']);
            this.lua_newuserdatauv = this.cwrap('lua_newuserdatauv', 'number', ['number', 'number', 'number']);
            this.lua_getmetatable = this.cwrap('lua_getmetatable', 'number', ['number', 'number']);
            this.lua_getiuservalue = this.cwrap('lua_getiuservalue', 'number', ['number', 'number', 'number']);
            this.lua_setglobal = this.cwrap('lua_setglobal', null, ['number', 'string']);
            this.lua_settable = this.cwrap('lua_settable', null, ['number', 'number']);
            this.lua_setfield = this.cwrap('lua_setfield', null, ['number', 'number', 'string']);
            this.lua_seti = this.cwrap('lua_seti', null, ['number', 'number', 'number']);
            this.lua_rawset = this.cwrap('lua_rawset', null, ['number', 'number']);
            this.lua_rawseti = this.cwrap('lua_rawseti', null, ['number', 'number', 'number']);
            this.lua_rawsetp = this.cwrap('lua_rawsetp', null, ['number', 'number', 'number']);
            this.lua_setmetatable = this.cwrap('lua_setmetatable', 'number', ['number', 'number']);
            this.lua_setiuservalue = this.cwrap('lua_setiuservalue', 'number', ['number', 'number', 'number']);
            this.lua_callk = this.cwrap('lua_callk', null, ['number', 'number', 'number', 'number', 'number']);
            this.lua_pcallk = this.cwrap('lua_pcallk', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
            this.lua_load = this.cwrap('lua_load', 'number', ['number', 'number', 'number', 'string', 'string']);
            this.lua_dump = this.cwrap('lua_dump', 'number', ['number', 'number', 'number', 'number']);
            this.lua_yieldk = this.cwrap('lua_yieldk', 'number', ['number', 'number', 'number', 'number']);
            this.lua_resume = this.cwrap('lua_resume', 'number', ['number', 'number', 'number', 'number']);
            this.lua_status = this.cwrap('lua_status', 'number', ['number']);
            this.lua_isyieldable = this.cwrap('lua_isyieldable', 'number', ['number']);
            this.lua_setwarnf = this.cwrap('lua_setwarnf', null, ['number', 'number', 'number']);
            this.lua_warning = this.cwrap('lua_warning', null, ['number', 'string', 'number']);
            this.lua_error = this.cwrap('lua_error', 'number', ['number']);
            this.lua_next = this.cwrap('lua_next', 'number', ['number', 'number']);
            this.lua_concat = this.cwrap('lua_concat', null, ['number', 'number']);
            this.lua_len = this.cwrap('lua_len', null, ['number', 'number']);
            this.lua_stringtonumber = this.cwrap('lua_stringtonumber', 'number', ['number', 'string']);
            this.lua_getallocf = this.cwrap('lua_getallocf', 'number', ['number', 'number']);
            this.lua_setallocf = this.cwrap('lua_setallocf', null, ['number', 'number', 'number']);
            this.lua_toclose = this.cwrap('lua_toclose', null, ['number', 'number']);
            this.lua_closeslot = this.cwrap('lua_closeslot', null, ['number', 'number']);
            this.lua_getstack = this.cwrap('lua_getstack', 'number', ['number', 'number', 'number']);
            this.lua_getinfo = this.cwrap('lua_getinfo', 'number', ['number', 'string', 'number']);
            this.lua_getlocal = this.cwrap('lua_getlocal', 'string', ['number', 'number', 'number']);
            this.lua_setlocal = this.cwrap('lua_setlocal', 'string', ['number', 'number', 'number']);
            this.lua_getupvalue = this.cwrap('lua_getupvalue', 'string', ['number', 'number', 'number']);
            this.lua_setupvalue = this.cwrap('lua_setupvalue', 'string', ['number', 'number', 'number']);
            this.lua_upvalueid = this.cwrap('lua_upvalueid', 'number', ['number', 'number', 'number']);
            this.lua_upvaluejoin = this.cwrap('lua_upvaluejoin', null, ['number', 'number', 'number', 'number', 'number']);
            this.lua_sethook = this.cwrap('lua_sethook', null, ['number', 'number', 'number', 'number']);
            this.lua_gethook = this.cwrap('lua_gethook', 'number', ['number']);
            this.lua_gethookmask = this.cwrap('lua_gethookmask', 'number', ['number']);
            this.lua_gethookcount = this.cwrap('lua_gethookcount', 'number', ['number']);
            this.lua_setcstacklimit = this.cwrap('lua_setcstacklimit', 'number', ['number', 'number']);
            this.luaopen_base = this.cwrap('luaopen_base', 'number', ['number']);
            this.luaopen_coroutine = this.cwrap('luaopen_coroutine', 'number', ['number']);
            this.luaopen_table = this.cwrap('luaopen_table', 'number', ['number']);
            this.luaopen_io = this.cwrap('luaopen_io', 'number', ['number']);
            this.luaopen_os = this.cwrap('luaopen_os', 'number', ['number']);
            this.luaopen_string = this.cwrap('luaopen_string', 'number', ['number']);
            this.luaopen_utf8 = this.cwrap('luaopen_utf8', 'number', ['number']);
            this.luaopen_math = this.cwrap('luaopen_math', 'number', ['number']);
            this.luaopen_debug = this.cwrap('luaopen_debug', 'number', ['number']);
            this.luaopen_package = this.cwrap('luaopen_package', 'number', ['number']);
            this.luaL_openlibs = this.cwrap('luaL_openlibs', null, ['number']);
        }
        lua_remove(luaState, index) {
            this.lua_rotate(luaState, index, -1);
            this.lua_pop(luaState, 1);
        }
        lua_pop(luaState, count) {
            this.lua_settop(luaState, -count - 1);
        }
        luaL_getmetatable(luaState, name) {
            return this.lua_getfield(luaState, LUA_REGISTRYINDEX, name);
        }
        lua_yield(luaState, count) {
            return this.lua_yieldk(luaState, count, 0, null);
        }
        lua_upvalueindex(index) {
            return LUA_REGISTRYINDEX - index;
        }
        ref(data) {
            const existing = this.referenceTracker.get(data);
            if (existing) {
                existing.refCount++;
                return existing.index;
            }
            const availableIndex = this.availableReferences.pop();
            const index = availableIndex === undefined ? this.referenceMap.size + 1 : availableIndex;
            this.referenceMap.set(index, data);
            this.referenceTracker.set(data, {
                refCount: 1,
                index,
            });
            this.lastRefIndex = index;
            return index;
        }
        unref(index) {
            const ref = this.referenceMap.get(index);
            if (ref === undefined) {
                return;
            }
            const metadata = this.referenceTracker.get(ref);
            if (metadata === undefined) {
                this.referenceTracker.delete(ref);
                this.availableReferences.push(index);
                return;
            }
            metadata.refCount--;
            if (metadata.refCount <= 0) {
                this.referenceTracker.delete(ref);
                this.referenceMap.delete(index);
                this.availableReferences.push(index);
            }
        }
        getRef(index) {
            return this.referenceMap.get(index);
        }
        getLastRefIndex() {
            return this.lastRefIndex;
        }
        printRefs() {
            for (const [key, value] of this.referenceMap.entries()) {
                console.log(key, value);
            }
        }
        cwrap(name, returnType, argTypes) {
            const hasStringOrNumber = argTypes.some((argType) => argType === 'string|number');
            if (!hasStringOrNumber) {
                return (...args) => this.module.ccall(name, returnType, argTypes, args);
            }
            return (...args) => {
                const pointersToBeFreed = [];
                const resolvedArgTypes = argTypes.map((argType, i) => {
                    var _a;
                    if (argType === 'string|number') {
                        if (typeof args[i] === 'number') {
                            return 'number';
                        }
                        else {
                            if (((_a = args[i]) === null || _a === void 0 ? void 0 : _a.length) > 1024) {
                                const bufferPointer = this.module.stringToNewUTF8(args[i]);
                                args[i] = bufferPointer;
                                pointersToBeFreed.push(bufferPointer);
                                return 'number';
                            }
                            else {
                                return 'string';
                            }
                        }
                    }
                    return argType;
                });
                try {
                    return this.module.ccall(name, returnType, resolvedArgTypes, args);
                }
                finally {
                    for (const pointer of pointersToBeFreed) {
                        this.module._free(pointer);
                    }
                }
            };
        }
    }

    var version = '1.15.0';

    class LuaFactory {
        constructor(customWasmUri, environmentVariables) {
            var _a;
            if (customWasmUri === undefined) {
                const isBrowser = (typeof window === 'object' && typeof window.document !== 'undefined') ||
                    (typeof self === 'object' && ((_a = self === null || self === void 0 ? void 0 : self.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'DedicatedWorkerGlobalScope');
                if (isBrowser) {
                    const majorminor = version.slice(0, version.lastIndexOf('.'));
                    customWasmUri = `copperlichtdata/script/wasm/dist/glue.wasm`;
                }
            }
            this.luaWasmPromise = LuaWasm.initialize(customWasmUri, environmentVariables);
        }
        async mountFile(path, content) {
            this.mountFileSync(await this.getLuaModule(), path, content);
        }
        mountFileSync(luaWasm, path, content) {
            const fileSep = path.lastIndexOf('/');
            const file = path.substring(fileSep + 1);
            const body = path.substring(0, path.length - file.length - 1);
            if (body.length > 0) {
                const parts = body.split('/').reverse();
                let parent = '';
                while (parts.length) {
                    const part = parts.pop();
                    if (!part) {
                        continue;
                    }
                    const current = `${parent}/${part}`;
                    try {
                        luaWasm.module.FS.mkdir(current);
                    }
                    catch (err) {
                    }
                    parent = current;
                }
            }
            luaWasm.module.FS.writeFile(path, content);
        }
        async createEngine(options = {}) {
            return new LuaEngine(await this.getLuaModule(), options);
        }
        async getLuaModule() {
            return this.luaWasmPromise;
        }
    }

    exports.Decoration = Decoration;
    exports.LUAI_MAXSTACK = LUAI_MAXSTACK;
    exports.LUA_MULTRET = LUA_MULTRET;
    exports.LUA_REGISTRYINDEX = LUA_REGISTRYINDEX;
    exports.LuaEngine = LuaEngine;
    exports.LuaFactory = LuaFactory;
    exports.LuaGlobal = Global;
    exports.LuaMultiReturn = MultiReturn;
    exports.LuaRawResult = RawResult;
    exports.LuaThread = Thread;
    exports.LuaTimeoutError = LuaTimeoutError;
    exports.LuaTypeExtension = LuaTypeExtension;
    exports.LuaWasm = LuaWasm;
    exports.PointerSize = PointerSize;
    exports.decorate = decorate;
    exports.decorateFunction = decorateFunction;
    exports.decorateProxy = decorateProxy;
    exports.decorateUserdata = decorateUserdata;

}));
