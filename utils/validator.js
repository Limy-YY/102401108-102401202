// 校验标题：非空
export function validateTitle(title) {
  if (!title || title.trim().length === 0) return '标题不能为空'
  return ''
}

// 校验分类：found(招领) / lost(寻物)
export function validateCategory(category) {
  const valid = ['found', 'lost']
  return valid.includes(category) ? '' : '请选择分类'
}

// 校验时间：非空（寻物=丢失时间，招领=拾取时间）
export function validateTime(time) {
  if (!time) return '请选择时间'
  return ''
}

// 校验地点：非空
export function validateLocation(location) {
  if (!location || location.trim().length === 0) return '请填写地点'
  return ''
}

// 校验联系人：非空
export function validateContactName(name) {
  if (!name || name.trim().length === 0) return '请填写联系人'
  return ''
}

// 校验手机号：11 位，1 开头
export function validatePhone(phone) {
  if (!phone) return '请填写手机号'
  if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确'
  return ''
}

// 校验状态：ongoing(进行中) / completed(已完成)
export function validateStatus(status) {
  const valid = ['ongoing', 'completed']
  return valid.includes(status) ? '' : '状态不合法'
}

// 整表校验，返回所有错误提示
export function validateForm(form) {
  const errors = []
  const titleErr = validateTitle(form.title)
  if (titleErr) errors.push(titleErr)
  const catErr = validateCategory(form.category)
  if (catErr) errors.push(catErr)
  const timeErr = validateTime(form.time)
  if (timeErr) errors.push(timeErr)
  const locErr = validateLocation(form.location)
  if (locErr) errors.push(locErr)
  const nameErr = validateContactName(form.contactName)
  if (nameErr) errors.push(nameErr)
  const phoneErr = validatePhone(form.contactPhone)
  if (phoneErr) errors.push(phoneErr)
  return errors
}
