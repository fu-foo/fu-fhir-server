/**
 * @file IGによる多重度チェック
 */
const _ = require('lodash');

function getValuesByPath(resource, path) {
  const segments = path.split('.');
  let current = [resource]; 
  for (const segment of segments) {
    const next = [];
    for (const item of current) {
      const val = _.get(item, segment);
      if (Array.isArray(val)) {
        next.push(...val);
      } else if (val !== undefined && val !== null) {
        next.push(val);
      }
    }
    current = next;
  }
  return current;
}


/**
 * 多重度チェック
 *
 * @param {Object} resource - FHIRリソース
 * @param {Object} structureDefinition - structureDefinition
 * @returns {string[]} 多重度エラーの内容を返す
 */
function validateCardinality(resource, structureDefinition) {
  const errors = [];
  const elements = structureDefinition.snapshot?.element || [];

  for (const element of elements) {
    const path = element.path;
    const min = element.min ?? 0;
    const max = element.max === '*' ? Infinity : parseInt(element.max);

    const relativePath = path.replace(/^.+?\./, '');

    const values = getValuesByPath(resource, relativePath);
    const actualCount = values.length;

    if (actualCount < min) {
      errors.push(`[${path}] がない (最小: ${min})`);
    } else if (actualCount > max) {
      errors.push(`[${path}] が想定以上にある (最大: ${max}, 実際: ${actualCount})`);
    }
  }

  return errors;
}

module.exports = { validateCardinality };
