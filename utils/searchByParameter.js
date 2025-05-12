
/**
 * @file searchParameterでの検索
 */
const fhirpath = require('fhirpath');
const fs = require('fs');

/**
 * FHIRPathでの検索
 * @param {Array<Object>} resourceList - FHIRリソース
 * @param {string} param - 検索項目
 * @param {string} value - 検索値
 * @returns {Array<Object>} 対象のリソース
 */
function searchByParameter(resourceList, param, value) {
  const result = [];
  // サーチパラメーター読み込み
  const searchParams = JSON.parse(fs.readFileSync('./defs/SearchParameter-FU.json', 'utf8'));

  // サーチパラメーター対象を検索
  for (const resource of resourceList) {
    const paramDef = searchParams.find(
      p => p.code === param && p.base.includes(resource.resourceType)
    );
    if (!paramDef) continue;

    const expr = paramDef.expression;
    const values = fhirpath.evaluate(resource, expr);

    if (values.some(v => typeof v === 'string' && v.includes(value))) {
      result.push(resource);
    }
  }

  // 対象をreturn
  return result;
}

module.exports = { searchByParameter };
