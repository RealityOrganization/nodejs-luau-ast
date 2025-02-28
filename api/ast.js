"use strict";
//TODO: Maybe add support for multiple variable declerations ('local a, b, c = foo()')
//TODO: Improve this code, its pretty chaotic
//this is prtty shit rn, will update it
//To remove useless variables completely, uncomment L97
//i'm adding a parser after this

const Trademark = [
	'Assembled using ast pro max i have a vison for that one',
	'pew',
	'i stole this from advanced decompiler v3 btw (shhh dont tell him)',
	'/*_*/',
	'Decompiled with SynapseX',
	'tip of the day: use the math library!',
	'Decompiled with Medal Decompiler',
	'Decompiled with the Oracle Decompiler.',
	'This has a lot of bugs, you have to fixe them'
];

const table_insert = function(tab, value) {
	tab.push(value);
};

const table_concat = function(tab, sep) {
	return tab.join(sep);
};

const AST_m = {};

AST_m.new = function(opt) {
	const AST = [];
	opt = opt || {
		Instacall: false, // from local v1 = loadstring('hi') v1() to loadstring('hi')() also it doesnt work
		IgnoreUselessVariables: true,
		RenameUselessVariables: false
	};
	function prepare() {
		const ____ = [];
		for (let i = 0; i < AST.length; i++) {
			const ___ = AST[i];
			if (typeof ___ === "object" && ___ !== null) {
				____[i] = ___;
			}
		}
		return ____;
	}
	AST.prepare = prepare;
	
	function replaceAllIndexes(tab, targetTab) {
		for (let i in targetTab) {
			if (targetTab.hasOwnProperty(i)) {
				tab[i] = targetTab[i];
			}
		}
	}
	
	function trackVarAST(variableName) {
		let __;
		const prep = AST.prepare();
		for (let i = 0; i < prep.length; i++) {
			const ___ = prep[i];
			if (___.Variable === variableName && (___.type.indexOf("Move") === -1)) {
				__ = ___;
			}
		}
		return __;
	}
	
	function trackVarASTMove(variableName) {
		let __;
		const prep = AST.prepare();
		for (let i = 0; i < prep.length; i++) {
			const ___ = prep[i];
			if (___.Variable === variableName && (___.type.indexOf("Move") !== -1)) {
				__ = ___;
			}
		}
		return __;
	}
	
	AST.AddVariableDecleration = function(Variable, Value, IsGlobal) {
		if (typeof Variable !== "string") {
			throw new Error("Invalid argument to #1 (AddVariableDecleration) expected string, got " + typeof Variable);
		}
		//if type(Value) ~= 'number' or type(Value) ~= 'string' then
		//	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		//end
		if (typeof IsGlobal !== "boolean") {
			throw new Error("Invalid argument to #3 (AddVariableDecleration) expected boolean, got " + typeof Variable);
		}
		if (trackVarAST(Variable)) {
			table_insert(AST, {
				Variable: String(Variable),
				Value: Value,
				type: "MoveVariableAssignment",
				isGlobal: IsGlobal,
			});
		} else {
			table_insert(AST, {
				Variable: String(Variable),
				Value: Value,
				type: "VariableAssignment",
				isGlobal: IsGlobal,
			});
		}
	};
	
	AST.AddCallDecleration = function(Variable, Tocall, Args) {
		if (typeof Variable !== "string") {
			throw new Error("Invalid argument to #1 (AddCallDecleration) expected string, got " + typeof Variable);
		}
		//if type(Value) ~= 'number' or type(Value) ~= 'string' then
		//	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		//end
		if (trackVarAST(Variable)) {
			table_insert(AST, {
				Variable: String(Variable),
				tocall: Tocall,
				type: "MoveCallAssignment",
				args: Args,
			});
		} else {
			table_insert(AST, {
				Variable: String(Variable),
				tocall: Tocall,
				type: "CallAssignment",
				args: Args,
			});
		}
	};
	
	AST.AddNamecallDecleration = function(Variable, Tocall, k, Args) {
		if (typeof Variable !== "string") {
			throw new Error("Invalid argument to #1 (AddCallDecleration) expected string, got " + typeof Variable);
		}
		//if type(Value) ~= 'number' or type(Value) ~= 'string' then
		//	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		//end
		if (trackVarAST(Variable)) {
			table_insert(AST, {
				Variable: String(Variable),
				tocall: Tocall,
				k: k,
				type: "MoveNamecallAssignment",
				args: Args,
			});
		} else {
			table_insert(AST, {
				Variable: String(Variable),
				tocall: Tocall,
				k: k,
				type: "NamecallAssignment",
				args: Args,
			});
		}
	};
	
	AST.AddForIndexLoop = function(Index, IndexValue, IndexIn, IndexOut) { // for Index = IndexValue, IndexIn, IndexOut do
		table_insert(AST, {
			type: "ForIndexLoop",
			IndexVariable: Index,
			IndexValue: IndexValue,
			IndexIn: IndexIn,
			IndexOut: IndexOut
		});
		//[[AST[endl] = {
		//	type = 'EndLine'
		//} -- this is really bad]]
	};
	
	AST.EndLine = function() {
		table_insert(AST, {
			type: "EndLine"
		});
	};
	
	AST.CreateTable = function(Variable) {
		if (trackVarAST(Variable)) {
			table_insert(AST, {
				type: "MoveTableAssignment",
				Variable: Variable
			});
		} else {
			table_insert(AST, {
				type: "TableAssignment",
				Variable: Variable
			});
		}
	};
	
	AST.SetTableIndex = function(TableVariable, TableIndex, TableValue) {
		table_insert(AST, {
			type: "TableIndexAssignment",
			Table: TableVariable,
			Index: TableIndex,
			Value: TableValue
		});
	};
	
	AST.trackVarAST = trackVarAST;
	
	AST.optimize = function() {
		const prepped = AST.prepare();
		for (let i = 0; i < prepped.length; i++) {
			const v = prepped[i];
			if (v.type === "VariableAssignment" || v.type === "MoveVariableAssignment") {
				v.used = false;
			}
			if (v.type === "CallAssignment" || v.type === "NamecallAssignment"  || v.type === "MoveCallAssignment" || v.type === "MoveNamecallAssignment") {
				v.ref = false;
			}
		}
		for (let i = 0; i < prepped.length; i++) {
			const v = prepped[i];
			if (v.type === "CallAssignment") {
				console.log(trackVarAST(v.tocall));
				if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
					v.tocall = trackVarAST(v.tocall).Value || v.tocall;
					if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
						if (trackVarAST(v.tocall).type === "NamecallAssignment" || trackVarAST(v.tocall).type === "CallAssignment") {
							//v.tocall = trackVarAST(v.tocall).tocall
							//console.log('g', trackVarAST(v.tocall))
							//v.k = trackVarAST(v.tocall).k
							//v.args = trackVarAST(v.tocall).args
							//v.type = 'NamecallDecleration'
							trackVarAST(v.tocall).ref = true;
							//console.log('BREH CALL' + String(trackVarAST(v.tocall)))
						}
					}
				}
				const args = [];
				function getrealtimearg(arg) {
					let arg_;
					if (trackVarAST(arg)) {
						if (trackVarAST(arg).type === "VariableAssignment") {
							arg_ = trackVarAST(arg).Value;
						} else if (trackVarAST(arg).type === "CallAssignment") {
							arg_ = String(trackVarAST(arg).tocall) + "(" + table_concat(trackVarAST(arg).args, ", ") + ")";
						}
					} else {
						arg_ = arg;
					}
					return arg_ || arg;
				}
				for (let j = 0; j < v.args.length; j++) {
					args[j] = getrealtimearg(v.args[j]);
				}
				v.args = args;
			} else if (v.type === "NamecallAssignment") {
				console.log(trackVarAST(v.tocall));
				if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
					v.tocall = trackVarAST(v.tocall).Value || v.tocall;
					if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
						if (trackVarAST(v.tocall).type === "NamecallAssignment" || trackVarAST(v.tocall).type === "CallAssignment") {
							if (opt.UseNamecallDirectly) {
								v.tocall = trackVarAST(v.tocall).tocall;
								v.k = trackVarAST(v.tocall).k;
								v.args = trackVarAST(v.tocall).args;
								v.type = "NamecallDecleration";
							} else {
								trackVarAST(v.tocall).ref = true;
							}
							//console.log('BREH CALL' + String(trackVarAST(v.tocall)))
						}
					}
				}
				const args = [];
				function getrealtimearg(arg) {
					let arg_;
					if (trackVarAST(arg)) {
						if (trackVarAST(arg).type === "VariableAssignment") {
							arg_ = trackVarAST(arg).Value;
						} else if (trackVarAST(arg).type === "CallAssignment") {
							arg_ = String(trackVarAST(arg).tocall) + "(" + table_concat(trackVarAST(arg).args, ", ") + ")";
						}
					} else {
						arg_ = arg;
					}
					return arg_ || arg;
				}
				for (let j = 0; j < v.args.length; j++) {
					args[j] = getrealtimearg(v.args[j]);
				}
				v.args = args;
			} else if (v.type === "MoveNamecallAssignment") {
				console.log(trackVarAST(v.tocall));
				trackVarAST(v.Variable).Value = v.Value;
				if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
					v.tocall = trackVarAST(v.tocall).Value || v.tocall;
					if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
						if (trackVarAST(v.tocall).type === "NamecallAssignment" || trackVarAST(v.tocall).type === "CallAssignment") {
							if (opt.UseNamecallDirectly) {
								v.tocall = trackVarAST(v.tocall).tocall;
								v.k = trackVarAST(v.tocall).k;
								v.args = trackVarAST(v.tocall).args;
								v.type = "NamecallDecleration";
							} else {
								trackVarAST(v.tocall).ref = true;
							}
							//console.log('BREH CALL' + String(trackVarAST(v.tocall)))
						}
					}
				}
				const args = [];
				function getrealtimearg(arg) {
					let arg_;
					if (trackVarAST(arg)) {
						if (trackVarAST(arg).type === "VariableAssignment") {
							arg_ = trackVarAST(arg).Value;
						} else if (trackVarAST(arg).type === "CallAssignment") {
							arg_ = String(trackVarAST(arg).tocall) + "(" + table_concat(trackVarAST(arg).args, ", ") + ")";
						}
					} else {
						arg_ = arg;
					}
					return arg_ || arg;
				}
				for (let j = 0; j < v.args.length; j++) {
					args[j] = getrealtimearg(v.args[j]);
				}
				v.args = args;
			} else if (v.type === "MoveCallAssignment") {
				console.log(trackVarAST(v.tocall));
				let backval = trackVarAST(v.tocall).Value;
				trackVarAST(v.tocall).Value = v.Value || backval || "--[[{Failed to obtain Variable Tack}]]";
				if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
					v.tocall = trackVarAST(v.tocall).Value || v.tocall;
					if (trackVarAST(v.tocall) !== undefined && trackVarAST(v.tocall) !== null) {
						if (trackVarAST(v.tocall).type === "NamecallAssignment" || trackVarAST(v.tocall).type === "CallAssignment") {
							//v.tocall = trackVarAST(v.tocall).tocall
							//console.log('g', trackVarAST(v.tocall))
							//v.k = trackVarAST(v.tocall).k
							//v.args = trackVarAST(v.tocall).args
							//v.type = 'NamecallDecleration'
							trackVarAST(v.tocall).ref = true;
							//console.log('BREH CALL' + String(trackVarAST(v.tocall)))
						}
					}
				}
				const args = [];
				function getrealtimearg(arg) {
					let arg_;
					if (trackVarAST(arg)) {
						if (trackVarAST(arg).type === "VariableAssignment") {
							arg_ = trackVarAST(arg).Value;
						} else if (trackVarAST(arg).type === "CallAssignment") {
							arg_ = String(trackVarAST(arg).tocall) + "(" + table_concat(trackVarAST(arg).args, ", ") + ")";
						}
					} else {
						arg_ = arg;
					}
					return arg_ || arg;
				}
				for (let j = 0; j < v.args.length; j++) {
					args[j] = getrealtimearg(v.args[j]);
				}
				v.args = args;
			} else if (v.type === "MoveVariableAssignment") {
				trackVarAST(v.Variable).Value = v.Value;
			} else if (v.type === "ForIndexLoop") {
				let Index = (trackVarAST(v.IndexValue) && trackVarAST(v.IndexValue).Value) || v.IndexValue; // we track the index value
				let IndexIn = (trackVarAST(v.IndexIn) && trackVarAST(v.IndexIn).Value) || v.IndexIn;
				let IndexOut = (trackVarAST(v.IndexOut) && trackVarAST(v.IndexOut).Value) || v.IndexOut;
				if (IndexOut && IndexIn && IndexOut.Value === IndexIn.Value) {
					IndexOut = undefined;
				}
				v.IndexIn = IndexIn;
				v.IndexValue = Index;
				v.IndexOut = IndexOut;
			} else if (v.type === "TableAssignment") {
				////
			//[[elseif v.type === 'TableIndexAssignment' then
			//	local tableAST = trackVarAST(v.Table)  -- Store the result once
			//	if tableAST and not tableAST['Assignments'] then
			//		tableAST['Assignments'] = {}
			//	end
			//
			//	if tableAST then
			//		local a = tableAST['Assignments']
			//		setmetatable(a, {
			//			__newindex = function(t, key, value)
			//				rawset(t, key, value)
			//			end,
			//		})
			//
			//		-- Safely assign the value
			//		a[v.Index] = trackVarAST(v.Value) or v.Value
			//		tableAST['Assignments'][v.Index] = trackVarAST(v.Value) or v.Value
			//	else
			//		-- Handle the case when trackVarAST(v.Table) is nil
			//		warn("trackVarAST(v.Table) returned nil for: " .. tostring(v.Table))
			//	end--]] -- this breaks the entire ast sooo TODO: Find a solution for this!
			}
		}
		for (let i = 0; i < prepped.length; i++) {
			const v = prepped[i];
			if (v.used === false) {
				if (opt.IgnoreUselessVariables) {
					v.ignore = true;
				}
				//[[if opt.RenameUselessVariables then
				//	v.Variable = "_"
				//end--]]
			}
		}
	};
	
	AST.toLua = function(concat) {
		let code = [];
		let indentation = 0;
		function GetIndentString() {
			let __ = "";
			for (let ___ = 1; ___ <= indentation; ___++) {
				__ += "\t";
			}
			return __ || "";
		}
		function c(s) {
			return GetIndentString() + s;
		}
		const AST_prepare = AST.prepare();
		for (let i = 0; i < AST_prepare.length; i++) {
			const v = AST_prepare[i];
			if (v.ignore === true) {
				if (opt.RenameUselessVariables) {
					v.Variable = "_";
				} else if (opt.IgnoreUselessVariables) {
					continue;
				}
			}
			if (v.type === "VariableAssignment") {
				if (v.isGlobal === false) {
					table_insert(code, c("local " + v.Variable + " = " + v.Value + ";"));
				} else {
					table_insert(code, c(v.Variable + " = " + v.Value + ";"));
				}
			} else if (v.type === "CallAssignment") {
				if (v.ref === false) {
					table_insert(code, c(v.tocall + "(" + table_concat(v.args, ", ") + ");"));
				} else {
					table_insert(code, c(v.Variable + " = " + v.tocall + "(" + table_concat(v.args, ", ") + ");"));
				}
			} else if (v.type === "NamecallAssignment") {
				if (v.ref === false) {
					table_insert(code, c(v.tocall + ":" + v.k + "(" + table_concat(v.args, ", ") + ");"));
				} else {
					table_insert(code, c(v.Variable + " = " + v.tocall + ":" + v.k + "(" + table_concat(v.args, ", ") + ");"));
				}
			} else if (v.type === "MoveVariableAssignment") {
				trackVarAST(v.Variable).Value = v.Value;
				if (v.isGlobal === false) {
					table_insert(code, c("local " + v.Variable + " = " + v.Value + ";"));
				} else {
					table_insert(code, c(v.Variable + " = " + v.Value + ";"));
				}
			} else if (v.type === "MoveCallAssignment") {
				trackVarAST(v.Variable).Value = v.Value;
				if (v.ref === false) {
					table_insert(code, c(v.tocall + "(" + table_concat(v.args, ", ") + ");"));
				} else {
					table_insert(code, c(v.Variable + " = " + v.tocall + "(" + table_concat(v.args, ", ") + ");"));
				}
			} else if (v.type === "ForIndexLoop") {
				let args = [
					v.IndexIn,
					v.IndexOut
				];
				args = args.filter(function(val) {
					return val !== undefined && val !== null;
				});
				table_insert(code, c("for " + v.IndexVariable + " = " + v.IndexValue + ", " + table_concat(args, ", ") + " do"));
				indentation++;
			} else if (v.type === "EndLine") {
				indentation--;
				table_insert(code, c("end"));
			} else if (v.type === "TableAssignment") {
				let args = v["Assignments"] || [];
				table_insert(code, c("local " + v.Variable + " = " + "{\n"));
				indentation++;
				let codeLines = [];
				for (let key in args) {
					if (args.hasOwnProperty(key)) {
						table_insert(codeLines, key + " = " + args[key]);
					}
				}
				if (codeLines[0] === undefined) {
					table_insert(code, c("local " + v.Variable + " = {'{}'};"));
				} else {
					table_insert(code, c("local " + v.Variable + " = {'{\n" + table_concat(codeLines, ",\n")));
				}
			}
		}
		if (concat === true || concat === undefined) {
			return "-- " + Trademark[Math.floor(Math.random() * Trademark.length)] + "\n" + code.join("\n");
		} else {
			return code;
		}
	};
	
	return AST;
};

//
//[[
//const AST = AST_m.new();
//AST.AddVariableDecleration('v1', 'print', false);
//AST.AddVariableDecleration('u1', '"raw.gith"', false);
//AST.AddNamecallDecleration('v5', 'game', 'HttpGet', {'u1'});
//AST.AddVariableDecleration('v2', '"Hello World!"', false);
//AST.AddCallDecleration('v3', 'v1', {'v2'});
//AST.AddCallDecleration('v18', 'v5', {});
//AST.AddVariableDecleration('v1', 'getgenv', false);
//AST.AddVariableDecleration('v15', 'game', true);
//AST.AddCallDecleration('v3', 'v1', {'v15', 'v2'});
//console.log(AST);
//AST.optimize();
//console.log(AST.toLua());
//]]

//
module.exports = async (req, res) => {
	try {
		if (req.method !== "POST") {
			res.status(405).send("method not fucking allowed");
			return;
		}
		
		let body = req.body;
		if (typeof body === "string") {
			body = JSON.parse(body);
		}
		if (!body || !body.operations || !Array.isArray(body.operations)) {
			res.status(400).send('invalid body expected your json with "operations" array');
			return;
		}
		
		const ast = AST_m.new();
		body.operations.forEach(op => {
			if (typeof ast[op.method] === "function") {
				ast[op.method](...op.args);
			} else {
				throw new Error("invalid asting method: " + op.method);
			}
		});
		
		ast.optimize();
		const outputCode = ast.toLua(true);
		
		res.status(200).json({ code: outputCode });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};