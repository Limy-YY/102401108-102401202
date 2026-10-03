// 图片工具：把临时图片路径转成 base64 data URL。
// 原因：H5 的 chooseImage 返回 blob: 临时地址、小程序返回 wxfile:// 临时文件，
// 页面刷新 / 重启后这些临时路径都会失效，导致已保存的图片无法再展示。
// 因此上传时统一转成 data URL 再持久化。

// H5：把 Blob 等比压缩到 maxSide 以内，并编码为 JPEG data URL，
// 避免原图过大、转 base64 后撑爆本地存储。
function blobToCompressedDataURL(blob, maxSide = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      const scale = Math.min(1, maxSide / Math.max(w, h))
      w = Math.round(w * scale)
      h = Math.round(h * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      // 白色底，避免透明 PNG 转 JPEG 后出现黑底
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}

// 读取本地临时文件为 base64 data URL（小程序 / App 场景）
function readFileAsDataURL(filePath) {
  return new Promise((resolve) => {
    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        const ext = (filePath.split('.').pop() || 'png').toLowerCase()
        const mime = ext === 'jpg' ? 'jpeg' : ext
        resolve('data:image/' + mime + ';base64,' + res.data)
      },
      fail: () => resolve(filePath)
    })
  })
}

export function fileToDataURL(filePath) {
  return new Promise((resolve) => {
    if (!filePath) {
      resolve(filePath)
      return
    }
    // 已经是 data URL，直接使用
    if (filePath.indexOf('data:') === 0) {
      resolve(filePath)
      return
    }

    // H5：blob: 临时地址，fetch 后压缩转 base64
    if (typeof fetch === 'function' && filePath.indexOf('blob:') === 0) {
      fetch(filePath)
        .then((r) => r.blob())
        .then(blobToCompressedDataURL)
        .then(resolve)
        .catch(() => resolve(filePath))
      return
    }

    // 小程序 / App：本地临时文件，优先压缩后再读 base64
    if (typeof uni !== 'undefined' && uni.getFileSystemManager) {
      if (uni.compressImage) {
        uni.compressImage({
          src: filePath,
          quality: 80,
          success: (r) => readFileAsDataURL(r.tempFilePath).then(resolve),
          fail: () => readFileAsDataURL(filePath).then(resolve)
        })
      } else {
        readFileAsDataURL(filePath).then(resolve)
      }
      return
    }

    // 兜底：无法转换时返回原路径（至少当前会话内能临时显示）
    resolve(filePath)
  })
}
