/**
 * @file IGによるValidation
 */

const fs = require("fs");
const fhirpath = require("fhirpath");
/** 
 * StructureDefinitionをロード
 */
const structureDefs = {
  Patient: JSON.parse(fs.readFileSync("./defs/StructureDefinition-FU-PATIENT.json", "utf8")),
};

/**
 * StructureDefinitonによるValidation
 *
 * @param {Object} resource - FHIRリソース
 * @returns {Object[]} - Validationエラー内容
 */
function validateResource(resource) {
  const def = structureDefs[resource.resourceType];
  if (!def) return []; // 定義がなければ何もしない

  const constraints = def.snapshot.element
    .filter(el => Array.isArray(el.constraint))
    .flatMap(el =>
      el.constraint.map(constraint => ({
        path: el.path,
        key: constraint.key,
        expression: constraint.expression,
        human: constraint.human,
        severity: constraint.severity
      }))
    );

  const results = constraints.map(c => {
    try {
      // fhirpathで評価
      const result = fhirpath.evaluate(resource, c.expression);
      const passed = Array.isArray(result) ? result.every(Boolean) : Boolean(result);

      return {
        key: c.key,
        severity: c.severity,
        expression: c.expression,
        message: c.human,
        passed: result
      };
    } catch (err) {
      return {
        key: c.key,
        message: `評価エラー: ${err.message}`,
      };
    }
  });

  return results.filter(r => !r.passed);
}

module.exports = { validateResource };