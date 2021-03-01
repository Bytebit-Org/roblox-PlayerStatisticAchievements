local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TestEZ = require(ReplicatedStorage.rbxts_include.node_modules.testez.src)

local testRoots = {
	ReplicatedStorage.out,
}
local results = TestEZ.TestBootstrap:run(testRoots, TestEZ.Reporters.TextReporter)

-- Did something go wrong?
if #results.errors > 0 or results.failureCount > 0 then
	error("Tests failed")
end
