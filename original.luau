--TODO: Maybe add support for multiple variable declerations ('local a, b, c = foo()')
--TODO: Improve this code, its pretty chaotic
--this is prtty shit rn, will update it
--To remove useless variables completely, uncomment L97
--i'm adding a parser after this

local Trademark = {
	'Assembled using ast pro max i have a vison for that one',
	'pew',
	'CODE IS RANDOM! This is very inaccurate and this was generated using GPT.',
	'i stole this from advanced decompiler v3 btw (shhh dont tell him)',
	'/*_*/',
	'Decompiled with SynapseX',
	'tip of the day: use the math library!',
	'Decompiled with Medal Decompiler',
	'Decompiled with the Oracle Decompiler.',
	'This has a lot of bugs, you have to fixe them'
}

local table_insert = table.insert
local table_concat = table.concat
local AST_m = {}

function AST_m.new(opt)
	local AST = {}
	opt = opt or {
		Instacall = false, -- from local v1 = loadstring('hi') v1() to loadstring('hi')() also it doesnt work
		IgnoreUselessVariables = true,
		RenameUselessVariables = false
	}
	function AST.prepare()
		local ____ = {}
		for __, ___ in pairs(AST) do
			if type(___) == 'table' then
				(____)[(__)] = (___)
			end
		end
		return (____)
	end
	local function replaceAllIndexes(tab, targetTab)
		for i, v in pairs(targetTab) do
			tab[i] = v
		end
	end
	local function trackVarAST(variableName)
		local __
		for _, ___ in pairs(AST.prepare()) do
			if ___.Variable == variableName and not ___.type:find('Move') then
				__ = ___
			end
		end
		return __
	end
	local function trackVarASTMove(variableName)
		local __
		for _, ___ in pairs(AST.prepare()) do
			if ___.Variable == variableName and ___.type:find('Move') then
				__ = ___
			end
		end
		return __
	end
	function AST.AddVariableDecleration(Variable, Value, IsGlobal)
		if type(Variable) ~= 'string' then
			error('Invalid argument to #1 (AddVariableDecleration) expected string, got ' .. type(Variable))
		end
		--if type(Value) ~= 'number' or type(Value) ~= 'string' then
		--	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		--end
		if type(IsGlobal) ~= 'boolean' then
			error('Invalid argument to #3 (AddVariableDecleration) expected boolean, got ' .. type(Variable))
		end
		if trackVarAST(Variable) then
			table_insert(AST, {
				Variable = tostring(Variable),
				Value = Value,
				type = 'MoveVariableAssignment',
				isGlobal = IsGlobal,
			})
		else
			table_insert(AST, {
				Variable = tostring(Variable),
				Value = Value,
				type = 'VariableAssignment',
				isGlobal = IsGlobal,
			})
		end
		
	end
	function AST.AddCallDecleration(Variable, Tocall, Args)
		if type(Variable) ~= 'string' then
			error('Invalid argument to #1 (AddCallDecleration) expected string, got ' .. type(Variable))
		end
		--if type(Value) ~= 'number' or type(Value) ~= 'string' then
		--	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		--end
		if trackVarAST(Variable) then
			table_insert(AST, {
				Variable = tostring(Variable),
				tocall = Tocall,
				type = 'MoveCallAssignment',
				args = Args,
			})
		else
			table_insert(AST, {
				Variable = tostring(Variable),
				tocall = Tocall,
				type = 'CallAssignment',
				args = Args,
			})
		end
	end
	
	function AST.AddNamecallDecleration(Variable, Tocall, k, Args)
		if type(Variable) ~= 'string' then
			error('Invalid argument to #1 (AddCallDecleration) expected string, got ' .. type(Variable))
		end
		--if type(Value) ~= 'number' or type(Value) ~= 'string' then
		--	error('Invalid argument to #2 (AddVariableDecleration) expected string, got ' .. type(Value))
		--end
		if trackVarAST(Variable) then
			table_insert(AST, {
				Variable = tostring(Variable),
				tocall = Tocall,
				k = k,
				type = 'MoveNamecallAssignment',
				args = Args,
			})
		else
			table_insert(AST, {
				Variable = tostring(Variable),
				tocall = Tocall,
				k = k,
				type = 'NamecallAssignment',
				args = Args,
			})
		end
		
	end
	function AST.AddForIndexLoop(Index, IndexValue, IndexIn, IndexOut) -- for Index = IndexValue, IndexIn, IndexOut do
		table_insert(AST, {
			type = 'ForIndexLoop',
			IndexVariable = Index,
			IndexValue = IndexValue,
			IndexIn = IndexIn,
			IndexOut = IndexOut
		})
		--[[AST[endl] = {
			type = 'EndLine'
		} -- this is really bad]]
	end
	function AST.EndLine()
		table_insert(AST, {
			type = 'EndLine'
		})
	end
	function AST.CreateTable(Variable)
		if trackVarAST(Variable) then
			table_insert(AST, {
				type = 'MoveTableAssignment',
				Variable = Variable
			})
		else
			table_insert(AST, {
				type = 'TableAssignment',
				Variable = Variable
			})
		end
	end
	function AST.SetTableIndex(TableVariable, TableIndex, TableValue)
		table_insert(AST, {
			type = 'TableIndexAssignment',
			Table = TableVariable,
			Index = TableIndex,
			Value = TableValue
		})
	end
	AST.trackVarAST = trackVarAST
	function AST.optimize()
		local prepped = AST.prepare()
		for i, v in pairs(prepped) do
			if v.type == 'VariableAssignment' or v.type == 'MoveVariableAssignment' then
				v.used = false
			end
			if v.type == 'CallAssignment' or v.type == 'NamecallAssignment'  or v.type == 'MoveCallAssignment' or v.type == 'MoveNamecallAssignment' then
				v.ref = false
			end
		end
		for i, v in pairs(prepped) do
			if v.type == 'CallAssignment' then
				print(trackVarAST(v.tocall))
				if trackVarAST(v.tocall) ~= nil then
					v.tocall = trackVarAST(v.tocall).Value or v.tocall
					if trackVarAST(v.tocall) ~= nil then
						if trackVarAST(v.tocall).type == 'NamecallAssignment' or trackVarAST(v.tocall).type == 'CallAssignment' then
							--v.tocall = trackVarAST(v.tocall).tocall
							--print('g', trackVarAST(v.tocall))
							--v.k = trackVarAST(v.tocall).k
							--v.args = trackVarAST(v.tocall).args
							--v.type = 'NamecallDecleration'
							trackVarAST(v.tocall).ref = true
							--print('BREH CALL' .. tostring(trackVarAST(v.tocall)))
						end
					end
				end
				local args = {}
				local function getrealtimearg(arg)
					local arg_
					if trackVarAST(arg) then
						if trackVarAST(arg).type == 'VariableAssignment' then
							arg_ = trackVarAST(arg).Value
						elseif trackVarAST(arg).type == 'CallAssignment' then
							arg_ = tostring(trackVarAST(arg).tocall) .. '(' .. table_concat(trackVarAST(arg).args, ', ') .. ')'
						end
					else
						arg_ = arg
					end
					return arg_ or arg
				end
				for i, v in pairs(v.args) do
					args[i] = getrealtimearg(v)
				end
				v.args = args
			elseif v.type == 'NamecallAssignment' then
				print(trackVarAST(v.tocall))
				if trackVarAST(v.tocall) ~= nil then
					v.tocall = trackVarAST(v.tocall).Value or v.tocall
					if trackVarAST(v.tocall) ~= nil then
						if trackVarAST(v.tocall).type == 'NamecallAssignment' or trackVarAST(v.tocall).type == 'CallAssignment' then
							if opt.UseNamecallDirectly then
								v.tocall = trackVarAST(v.tocall).tocall
								v.k = trackVarAST(v.tocall).k
								v.args = trackVarAST(v.tocall).args
								v.type = 'NamecallDecleration'
							else
								trackVarAST(v.tocall).ref = true
							end
							--print('BREH CALL' .. tostring(trackVarAST(v.tocall)))
						end
					end
				end
				local args = {}
				local function getrealtimearg(arg)
					local arg_
					if trackVarAST(arg) then
						if trackVarAST(arg).type == 'VariableAssignment' then
							arg_ = trackVarAST(arg).Value
						elseif trackVarAST(arg).type == 'CallAssignment' then
							arg_ = tostring(trackVarAST(arg).tocall) .. '(' .. table_concat(trackVarAST(arg).args, ', ') .. ')'
						end
					else
						arg_ = arg
					end
					return arg_ or arg
				end
				for i, v in pairs(v.args) do
					args[i] = getrealtimearg(v)
				end
				v.args = args
			elseif v.type == 'MoveNamecallAssignment' then
				print(trackVarAST(v.tocall))
				trackVarAST(v.Variable).Value = v.Value
				if trackVarAST(v.tocall) ~= nil then
					v.tocall = trackVarAST(v.tocall).Value or v.tocall
					if trackVarAST(v.tocall) ~= nil then
						if trackVarAST(v.tocall).type == 'NamecallAssignment' or trackVarAST(v.tocall).type == 'CallAssignment' then
							if opt.UseNamecallDirectly then
								v.tocall = trackVarAST(v.tocall).tocall
								v.k = trackVarAST(v.tocall).k
								v.args = trackVarAST(v.tocall).args
								v.type = 'NamecallDecleration'
							else
								trackVarAST(v.tocall).ref = true
							end
							--print('BREH CALL' .. tostring(trackVarAST(v.tocall)))
						end
					end
				end
				local args = {}
				local function getrealtimearg(arg)
					local arg_
					if trackVarAST(arg) then
						if trackVarAST(arg).type == 'VariableAssignment' then
							arg_ = trackVarAST(arg).Value
						elseif trackVarAST(arg).type == 'CallAssignment' then
							arg_ = tostring(trackVarAST(arg).tocall) .. '(' .. table_concat(trackVarAST(arg).args, ', ') .. ')'
						end
					else
						arg_ = arg
					end
					return arg_ or arg
				end
				for i, v in pairs(v.args) do
					args[i] = getrealtimearg(v)
				end
				v.args = args
			elseif v.type == 'MoveCallAssignment' then
				print(trackVarAST(v.tocall))
				local backval = trackVarAST(v.tocall).Value
				trackVarAST(v.tocall).Value = v.Value or backval or '--[[{Failed to obtain Variable Tack}]]'
				if trackVarAST(v.tocall) ~= nil then
					v.tocall = trackVarAST(v.tocall).Value or v.tocall
					if trackVarAST(v.tocall) ~= nil then
						if trackVarAST(v.tocall).type == 'NamecallAssignment' or trackVarAST(v.tocall).type == 'CallAssignment' then
							--v.tocall = trackVarAST(v.tocall).tocall
							--print('g', trackVarAST(v.tocall))
							--v.k = trackVarAST(v.tocall).k
							--v.args = trackVarAST(v.tocall).args
							--v.type = 'NamecallDecleration'
							trackVarAST(v.tocall).ref = true
							--print('BREH CALL' .. tostring(trackVarAST(v.tocall)))
						end
					end
				end
				local args = {}
				local function getrealtimearg(arg)
					local arg_
					if trackVarAST(arg) then
						if trackVarAST(arg).type == 'VariableAssignment' then
							arg_ = trackVarAST(arg).Value
						elseif trackVarAST(arg).type == 'CallAssignment' then
							arg_ = tostring(trackVarAST(arg).tocall) .. '(' .. table_concat(trackVarAST(arg).args, ', ') .. ')'
						end
					else
						arg_ = arg
					end
					return arg_ or arg
				end
				for i, v in pairs(v.args) do
					args[i] = getrealtimearg(v)
				end
				v.args = args
			elseif v.type == 'MoveVariableAssignment' then
				trackVarAST(v.Variable).Value = v.Value
			elseif v.type == 'ForIndexLoop' then
				local Index = trackVarAST(v.IndexValue).Value or v.IndexValue -- we track the index value
				local IndexIn = trackVarAST(v.IndexIn).Value or v.IndexIn
				local IndexOut = trackVarAST(v.IndexOut).Value or v.IndexOut
				if IndexOut.Value == IndexIn.Value then
					IndexOut = nil
				end
				v.IndexIn = IndexIn
				v.IndexValue = Index
				v.IndexOut = IndexOut
			elseif v.type == 'TableAssignment' then
				--//
			--[[elseif v.type == 'TableIndexAssignment' then
				local tableAST = trackVarAST(v.Table)  -- Store the result once
				if tableAST and not tableAST['Assignments'] then
					tableAST['Assignments'] = {}
				end

				if tableAST then
					local a = tableAST['Assignments']
					setmetatable(a, {
						__newindex = function(t, key, value)
							rawset(t, key, value)
						end,
					})

					-- Safely assign the value
					a[v.Index] = trackVarAST(v.Value) or v.Value
					tableAST['Assignments'][v.Index] = trackVarAST(v.Value) or v.Value
				else
					-- Handle the case when trackVarAST(v.Table) is nil
					warn("trackVarAST(v.Table) returned nil for: " .. tostring(v.Table))
				end--]] -- this breaks the entire ast sooo TODO: Find a solution for this!
			end
		end
		for i, v in pairs(prepped) do
			if v.used == false then
				if opt.IgnoreUselessVariables then
					v.ignore = true
				end
				--[[if opt.RenameUselessVariables then
					v.Variable = "_"
				end--]]
			end
		end
	end
	function AST.toLua(concat)
		local code = {}
		local indentation = 0
		local function GetIndentString()
			local __ = ""
			for ___ = 1, indentation do
				__ = __ .. "	"
			end
			return __ or ""
		end
		local function c(s)
			return GetIndentString() .. s
		end
		local AST_prepare = AST.prepare()
		for i, v in pairs(AST_prepare) do
			if v.ignore == true then
				if opt.RenameUselessVariables then
					v.Variable = "_"
				elseif opt.IgnoreUselessVariables then
					continue
				end
			end
			if v.type == 'VariableAssignment' then
				if v.isGlobal == false then
					table_insert(code, c(`local {v.Variable} = {v.Value};`))
				else
					table_insert(code, c(`{v.Variable} = {v.Value};`))
				end
			elseif v.type == 'CallAssignment' then
				if v.ref == false then
					table_insert(code, c(`{v.tocall}({table_concat(v.args, ', ')});`))
				else
					table_insert(code, c(`{v.Variable} = {v.tocall}({table_concat(v.args, ', ')});`))
				end
			elseif v.type == 'NamecallAssignment' then
				if v.ref == false then
					table_insert(code, c(`{v.tocall}:{v.k}({table_concat(v.args, ', ')});`))
				else
					table_insert(code, c(`{v.Variable} = {v.tocall}:{v.k}({table_concat(v.args, ', ')});`))
				end
			elseif v.type == 'MoveVariableAssignment' then
				trackVarAST(v.Variable).Value = v.Value
				if v.isGlobal == false then
					table_insert(code, c(`local {v.Variable} = {v.Value};`))
				else
					table_insert(code, c(`{v.Variable} = {v.Value};`))
				end
			elseif v.type == 'MoveCallAssignment' then
				trackVarAST(v.Variable).Value = v.Value
				if v.ref == false then
					table_insert(code, c(`{v.tocall}({table_concat(v.args, ', ')});`))
				else
					table_insert(code, c(`{v.Variable} = {v.tocall}({table_concat(v.args, ', ')});`))
				end
			elseif v.type == 'ForIndexLoop' then
				local args = {
					v.IndexIn,
					v.IndexOut
				}
				setmetatable(args, {
					__newindex = function(tab, key, val)
						if val == nil then
							return
						else
							rawset(tab, key, val)
						end
					end,
				})
				table_insert(code, c(`for {v.IndexVariable} = {v.IndexValue}, {table_concat(args, ", ")} do`))
				indentation += 1
			elseif v.type == "EndLine" then
				indentation -= 1
				table_insert(code, c(`end`))
			elseif v.type == 'TableAssignment' then
				if v['Assignments'] then
					args = v['Assignments']
				end
				table_insert(code, c(`local {v.Variable} = ` .. '{\n'))
				indentation += 1
				local codeLines = {}
				for i, v in pairs(args) do
					table_insert(codeLines, `{i} = {v}`)
				end
				if codeLines[1] == nil then
					table_insert(code, c(`local {v.Variable} = {'{}'};`))
				else
					table_insert(code, c(`local {v.Variable} = {'{\n' .. table_concat(codeLines, ",\n")};`))
				end
			end
		end
		if concat == true or concat == nil then
			return '-- ' .. tostring(Trademark[math.random(1, #Trademark)]) .. '\n' .. table.concat(code, '\n')
		else
			return code
		end
	end
	return AST
end


--[[
local AST = AST_m.new()
AST.AddVariableDecleration('v1', 'print', false)
AST.AddVariableDecleration('u1', '"raw.gith"', false)
AST.AddNamecallDecleration('v5', 'game', 'HttpGet', {'u1'})
AST.AddVariableDecleration('v2', '"Hello World!"', false)
AST.AddCallDecleration('v3', 'v1', {'v2'})
AST.AddCallDecleration('v18', 'v5', {})
AST.AddVariableDecleration('v1', 'getgenv', false)
AST.AddVariableDecleration('v15', 'game', true)
AST.AddCallDecleration('v3', 'v1', {'v15', 'v2'})
print(AST)
AST.optimize()
print(AST.toLua())

]]

return AST_m
