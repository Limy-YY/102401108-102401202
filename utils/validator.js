import { CATEGORY_VALUES } from './constants.js'

// 校验物品名称：非空
export function validateItemName(name) {
  if (!name || name.trim().length === 0) return '物品名称不能为空'
  return ''
}

// 校验分类：lost(寻物) / found(招领)，合法值从 constants 统一读取
export function validateCategory(category) {
  return CATEGORY_VALUES.includes(category) ? '' : '请选择分类'
}

// 校验发现时间：非空
export function validateTime(time) {
  if (!time) return '请选择发现时间'
  return ''
}

// 校验场所：非空
export function validateLocationTag(locationTag) {
  if (!locationTag || locationTag.trim().length === 0) return '请选择场所'
  return ''
}

// 整表校验，返回所有错误提示（页面只取第一条展示）
// 联系人/手机号不在此处校验——它们由发布者的个人名片统一提供
export function validateForm(form) {
  const errors = []
  const nameErr = validateItemName(form.itemName)
  if (nameErr) errors.push(nameErr)
  const catErr = validateCategory(form.category)
  if (catErr) errors.push(catErr)
  const timeErr = validateTime(form.time)
  if (timeErr) errors.push(timeErr)
  const locErr = validateLocationTag(form.locationTag)
  if (locErr) errors.push(locErr)
  return errors
}
