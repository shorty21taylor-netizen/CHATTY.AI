import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Inline the pure function to avoid needing tsx/tsconfig for imports
function renderTemplate(promptText, variables) {
  const missing = [];
  const text = promptText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in variables) return variables[key];
    missing.push(key);
    return match;
  });
  return { text, missingVariables: missing };
}

describe("renderTemplate", () => {
  it("substitutes all variables", () => {
    const result = renderTemplate(
      "Hi {{name}}, welcome to {{company}}!",
      { name: "Sarah", company: "Taylor Roofing" },
    );
    assert.equal(result.text, "Hi Sarah, welcome to Taylor Roofing!");
    assert.deepEqual(result.missingVariables, []);
  });

  it("leaves missing variables as-is and reports them", () => {
    const result = renderTemplate(
      "Hi {{name}}, your appointment is {{date}} at {{time}}.",
      { name: "Mike" },
    );
    assert.equal(
      result.text,
      "Hi Mike, your appointment is {{date}} at {{time}}.",
    );
    assert.deepEqual(result.missingVariables, ["date", "time"]);
  });

  it("handles empty variables object", () => {
    const result = renderTemplate("Hello {{name}}!", {});
    assert.equal(result.text, "Hello {{name}}!");
    assert.deepEqual(result.missingVariables, ["name"]);
  });

  it("handles template with no variables", () => {
    const result = renderTemplate("No variables here.", { name: "test" });
    assert.equal(result.text, "No variables here.");
    assert.deepEqual(result.missingVariables, []);
  });

  it("handles multiple occurrences of same variable", () => {
    const result = renderTemplate(
      "{{name}} said hi. {{name}} is cool.",
      { name: "Sam" },
    );
    assert.equal(result.text, "Sam said hi. Sam is cool.");
    assert.deepEqual(result.missingVariables, []);
  });
});
