<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <text class="close-btn" @click="handleCancel">×</text>
      <view class="title">{{ isEdit ? '编辑发布' : '发布信息' }}</view>
      <view class="submit-btn" :class="{ disabled: isSubmitting }" @click="handleSubmit">
        {{ isEdit ? '保存' : '发布' }}
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-area">

    <!-- 类型选择 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">📋</text>
        <text>类型<text class="req-star">*</text></text>
      </view>
      <view class="item-content-wrapper">
        <picker mode="selector" :range="CATEGORY_OPTIONS" :value="typeIndex" @change="onTypeChange">
          <view class="input-box">
            <text :class="{ 'placeholder': form.category === '' }">{{ form.category ? formatCategory(form.category) : '请选择' }}</text>
            <text class="arrow"></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 物品名称 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">📦</text>
        <text>物品<text class="req-star">*</text></text>
      </view>
      <view class="item-content-wrapper">
        <input class="input-box" placeholder="请输入物品名称" v-model="form.itemName" placeholder-class="placeholder" maxlength="20" @keydown="guardItemName" />
        <view class="detail-count">{{ form.itemName.length }}/20</view>
      </view>
    </view>

    <!-- 地点标签 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">🏫</text>
        <text>场所<text class="req-star">*</text></text>
      </view>
      <view class="item-content-wrapper">
        <picker mode="selector" :range="LOCATION_TAGS" :value="locationTagIndex" @change="onLocationTagChange">
          <view class="input-box">
            <text :class="{ 'placeholder': form.locationTag === '' }">{{ form.locationTag || '请选择' }}</text>
            <text class="arrow"></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 地点细节 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">📍</text>
        <text>位置</text>
      </view>
      <view class="item-content-wrapper">
        <input class="input-box" placeholder="请输入具体位置，如东3-305" v-model="form.locationDetail" placeholder-class="placeholder" maxlength="20" @keydown="guardLocationDetail" />
        <view class="detail-count">{{ form.locationDetail.length }}/20</view>
      </view>
    </view>

    <!-- 时间：日期 + 具体时间（精确到分钟） -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">🕐</text>
        <text>时间<text class="req-star">*</text></text>
      </view>
      <view class="item-content-wrapper time-pickers">
        <picker mode="date" :value="dateStr" @change="onDateChange">
          <view class="input-box">
            <text :class="{ 'placeholder': !dateStr }">{{ dateStr || timePlaceholder }}</text>
            <text class="arrow"></text>
          </view>
        </picker>
        <picker mode="time" :value="timeStr" @change="onClockChange">
          <view class="input-box">
            <text :class="{ 'placeholder': !timeStr }">{{ timeStr || '选择具体时间' }}</text>
            <text class="arrow"></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 颜色 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">🎨</text>
        <text>颜色</text>
      </view>
      <view class="item-content-wrapper">
        <input class="input-box" v-model="form.color" placeholder="请输入物品颜色，如黑色、藏青色" placeholder-class="placeholder" maxlength="20" @keydown="guardColor" />
        <view class="detail-count">{{ form.color.length }}/20</view>
      </view>
    </view>

    <!-- 图片上传 -->
    <view class="form-item vertical-item">
      <view class="item-label">
        <text class="label-icon">🖼️</text>
        <text>图片</text>
      </view>
      <view class="item-content-wrapper">
        <view class="image-upload-area" @click="chooseImage" v-if="form.images.length < 1">
          <text class="plus-icon">+</text>
          <text class="upload-text">选择图片</text>
        </view>
        <view class="image-preview-grid" v-else>
          <view class="image-preview-item" v-for="(img, index) in form.images" :key="index">
            <view class="preview-img-wrap">
              <image :src="img" mode="aspectFill" class="preview-img" @click.stop="previewImage(index)"></image>
            </view>
            <view class="delete-btn" @click.stop="removeImage(index)">×</view>
          </view>
          <view class="upload-trigger" @click.stop="chooseImage" v-if="form.images.length < 3">
            <text class="plus-icon">+</text>
            <text class="upload-text">添加</text>
          </view>
        </view>
        <view class="image-count">最多上传3张，已上传 {{ form.images.length }} 张</view>
      </view>
    </view>

    <!-- 细节描述 -->
    <view class="form-item vertical-item">
      <view class="item-label">
        <text class="label-icon">📝</text>
        <text>细节</text>
      </view>
      <view class="item-content-wrapper">
        <textarea
          class="detail-textarea"
          placeholder="请输入具体细节..."
          v-model="form.detail"
          placeholder-class="placeholder"
          auto-height
          maxlength="200"
        />
        <view class="detail-count">{{ form.detail.length }}/200</view>
      </view>
    </view>

    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';
import { ref, reactive, computed } from 'vue';
import { saveItem, updateItem, getItemById } from '@/utils/storage.js';
import { validateForm } from '@/utils/validator.js';
import { formatCategory } from '@/utils/format.js';
import { CATEGORY_OPTIONS, CATEGORY_VALUES, LOCATION_TAGS } from '@/utils/constants.js';
import { fileToDataURL } from '@/utils/image.js';
import { backOrHome } from '@/utils/nav.js';
import { makeLengthGuard } from '@/utils/inputRules.js';

// 本页同时承担「新建发布」和「编辑」两种模式，由 storage 中的 edit_item_id 区分（见 onShow）
// 表单字段白名单：提交载荷、编辑回填都从这里取，字段增删只维护这一处
const PAYLOAD_FIELDS = ['category', 'itemName', 'locationTag', 'locationDetail', 'time', 'color', 'images', 'detail'];

// 空表单工厂：新建 / 复位时生成一份干净表单（images 每次都是新数组）
const createEmptyForm = () => ({
  category: '',
  itemName: '',
  locationTag: '',
  locationDetail: '',
  time: '',
  color: '',
  images: [],
  detail: ''
});

const form = reactive(createEmptyForm());

const isSubmitting = ref(false);
const isEdit = ref(false);
const editId = ref(null);

// 让 picker 回显正确选中项：indexOf 未选中时返回 -1，用 Math.max(0, ...) 兜底为 0
const typeIndex = computed(() => Math.max(0, CATEGORY_VALUES.indexOf(form.category)));
const locationTagIndex = computed(() => Math.max(0, LOCATION_TAGS.indexOf(form.locationTag)));

// 隐藏底部导航栏
uni.hideTabBar({ animation: false });

// 选择图片：上传后先转成 base64 data URL 再存入，避免临时路径失效导致图片无法展示
const chooseImage = () => {
  uni.chooseImage({
    count: 3 - form.images.length,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const paths = res.tempFilePaths || [];
      for (const p of paths) {
        const dataUrl = await fileToDataURL(p);
        form.images.push(dataUrl);
      }
    }
  });
}

// 删除图片
const removeImage = (index) => {
  form.images.splice(index, 1);
};

// 预览图片：点击放大查看
const previewImage = (index) => {
  uni.previewImage({
    urls: form.images,
    current: form.images[index]
  });
};

// 监听下拉选择变化
const onTypeChange = (e) => { form.category = CATEGORY_VALUES[e.detail.value]; };
const onLocationTagChange = (e) => { form.locationTag = LOCATION_TAGS[e.detail.value]; };

// 时间占位提示：寻物=丢失时间，招领=发现时间
const timePlaceholder = computed(() => form.category === 'lost' ? '请选择丢失时间' : '请选择发现时间');

// 日期与具体时间各自独立存储，避免「先选时间再选日期」时互相覆盖
const dateStr = ref('');
const timeStr = ref('');

// 只有日期、时间都已选择时才拼装为 "YYYY-MM-DD HH:mm"（两者均必填）
const syncTime = () => {
  form.time = (dateStr.value && timeStr.value) ? dateStr.value + ' ' + timeStr.value : '';
};

const onDateChange = (e) => { dateStr.value = e.detail.value; syncTime(); };
const onClockChange = (e) => { timeStr.value = e.detail.value; syncTime(); };

// 自由文本字段长度限制：超过 20 字时在按键层拦截并提示
const guardItemName = makeLengthGuard(20, '物品名称最多 20 字', () => form.itemName.length)
const guardLocationDetail = makeLengthGuard(20, '具体位置最多 20 字', () => form.locationDetail.length)
const guardColor = makeLengthGuard(20, '颜色最多 20 字', () => form.color.length)

// 复位表单为「新建发布」状态（提交成功 / 取消时调用）
const resetForm = () => {
  Object.assign(form, createEmptyForm());
  dateStr.value = '';
  timeStr.value = '';
  isEdit.value = false;
  editId.value = null;
};

// 取消：放弃当前编辑/发布内容，复位后离开
const handleCancel = () => {
  resetForm();
  backOrHome();
};

// 提交表单
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // 日期与具体时间均为必填（先单独校验，提示更精确）
  if (!dateStr.value) {
    uni.showToast({ title: '请选择日期', icon: 'none' });
    return;
  }
  if (!timeStr.value) {
    uni.showToast({ title: '请选择具体时间', icon: 'none' });
    return;
  }

  // 提交前整表校验，未通过则提示第一条错误
  const errors = validateForm(form);
  if (errors.length > 0) {
    uni.showToast({ title: errors[0], icon: 'none' });
    return;
  }

  isSubmitting.value = true;

  // 只取白名单字段组成干净载荷，避免把 form 上残留的 id/createTime 等脏字段写回存储
  const payload = {};
  PAYLOAD_FIELDS.forEach((f) => { payload[f] = form[f]; });

  // 先记录本次是「修改」还是「发布」，resetForm 会把 isEdit 复位，故需提前保存
  const wasEdit = isEdit.value;
  let savedItem;
  try {
    if (wasEdit) {
      savedItem = await updateItem(editId.value, payload);
    } else {
      savedItem = await saveItem(payload);
    }
  } catch (e) {
    isSubmitting.value = false;
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
    return;
  }

  // 提交成功即结束本次编辑/发布，复位表单，避免下次回到本页仍残留旧内容
  resetForm();

  setTimeout(() => {
    isSubmitting.value = false;
    // 把记录的 id 和操作类型传给 modal，用于区分「发布成功 / 修改成功」标题
    uni.navigateTo({
      url: '/pages/modal/modal?id=' + savedItem.id + '&mode=' + (wasEdit ? 'edit' : 'create')
    });
  }, 800);
};

// 页面显示时：区分「新建」和「编辑」。
// 注意：不要在这里无脑清空表单，否则编辑中途切换 Tab 再切回会丢失已填内容。
onShow(async () => {
  // 编辑模式：从详情页「编辑」进入时通过 storage 传递待编辑 id。
  // publish 是 tabBar 页，switchTab 无法携带 query，故用 storage 中转后立即清除。
  const rawEditId = uni.getStorageSync('edit_item_id');
  if (rawEditId) {
    uni.removeStorageSync('edit_item_id');
    try {
      const res = await getItemById(Number(rawEditId));
      const item = res.item;
      if (item) {
        isEdit.value = true;
        editId.value = item.id;
        // 只回填白名单字段，缺失字段用空表单默认值兜底（status 默认 ongoing、images 默认 []）
        const defaults = createEmptyForm();
        PAYLOAD_FIELDS.forEach((f) => {
          form[f] = item[f] == null ? defaults[f] : item[f];
        });
        // 回填两个时间下拉框的独立状态，避免编辑时时间丢失
        const parts = (form.time || '').split(' ');
        dateStr.value = parts[0] || '';
        timeStr.value = parts[1] || '';
      }
    } catch (e) {}
    return;
  }

  // 「继续发布」显式请求复位为新建
  if (uni.getStorageSync('publish_reset')) {
    uni.removeStorageSync('publish_reset');
    resetForm();
  }
  // 其余情况（首次进入、编辑中切换 Tab 再切回等）：保留当前状态，不复位
});

</script>

<style scoped>

.page-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #F9F1E6;
  overflow: hidden;
}

.top-nav {
  height: 100rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  flex-shrink: 0;
  position: relative;
}

.close-btn {
  font-size: 60rpx;
  color: #333;
  width: 50rpx;
  z-index: 1;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.submit-btn {
  position: absolute;
  right: 30rpx;
  background-color: #FF7A33;
  color: #FFFFFF;
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  line-height: 1;
  z-index: 1;
}

.submit-btn.disabled {
  opacity: 0.6;
}

.form-area {
  flex: 1;
  height: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 40rpx 40rpx 0 40rpx;
  box-sizing: border-box;
  overscroll-behavior: none;
}

.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 最后一项不留底部间距：避免表单内容能显示完却仍可下滑一点距离 */
.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 28rpx;
  color: #333333;
  width: 140rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
  padding-top: 20rpx;
  white-space: nowrap;
}

.label-icon {
  font-size: 32rpx;
  line-height: 1;
}

/* 必填项红标：inline 保证与标签同行，不换行 */
.req-star {
  color: #E64340;
  margin-left: 4rpx;
  display: inline;
}

.item-content-wrapper {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  margin-left: 20rpx;
  margin-right: 10rpx;
}

.input-box {
  background-color: #FFFFFF;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333;
  -webkit-user-select: text;
  user-select: text;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
  width: 100%;
  min-height: 88rpx;
}

/* 时间字段：日期 + 时间两个选择框上下排列 */
.time-pickers {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-textarea {
  width: 100%;
  background-color: #FFFFFF;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333;
  -webkit-user-select: text;
  user-select: text;
  min-height: 160rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.image-upload-area {
  width: 100%;
  height: 180rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.image-preview-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 20rpx;
  box-sizing: border-box;
}

.image-preview-item {
  width: 180rpx;
  height: 180rpx;
  position: relative;
  flex-shrink: 0;
}

.preview-img-wrap {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  display: block;
}

.delete-btn {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: #666666;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  line-height: 1;
  z-index: 2;
}

.upload-trigger {
  width: 180rpx;
  height: 180rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #D8D8D8;
  box-sizing: border-box;
  flex-shrink: 0;
}

.plus-icon {
  font-size: 60rpx;
  color: #999999;
  line-height: 1;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
}

/* 竖向排列的表单项（图片、细节） */
.vertical-item {
  flex-direction: column;
  align-items: flex-start;
}

.vertical-item .item-label {
  width: auto;
  margin-bottom: 20rpx;
  padding-top: 0;
}

.vertical-item .item-content-wrapper {
  width: 95%;
  margin-right: 0rpx;
  margin-top: 10rpx;
}

.detail-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 8rpx;
}

.image-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 8rpx;
}

.arrow {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-top: 12rpx solid #999;
  flex-shrink: 0;
}

</style>
