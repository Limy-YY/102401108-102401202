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

    <!-- 状态 (仅编辑模式显示，置于最上方更醒目) -->
    <view class="form-item" v-if="isEdit">
      <view class="item-label">
        <text class="label-icon">✅</text>
        <text>状态</text>
      </view>
      <view class="item-content-wrapper">
        <picker mode="selector" :range="STATUS_OPTIONS" :value="statusIndex" @change="onStatusChange">
          <view class="input-box">
            <text :class="{ 'placeholder': form.status === '' }">{{ form.status ? formatStatus(form.status) : '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 类型选择 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">📋</text>
        <text>类型</text>
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
        <text>物品</text>
      </view>
      <view class="item-content-wrapper">
        <input class="input-box" placeholder="请输入物品名称" v-model="form.itemName" placeholder-class="placeholder" />
      </view>
    </view>

    <!-- 地点标签 -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">🏫</text>
        <text>场所</text>
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
        <input class="input-box" placeholder="请输入具体位置，如中东3-305" v-model="form.locationDetail" placeholder-class="placeholder" />
      </view>
    </view>

    <!-- 时间：日期 + 具体时间（精确到分钟） -->
    <view class="form-item">
      <view class="item-label">
        <text class="label-icon">🕐</text>
        <text>时间</text>
      </view>
      <view class="item-content-wrapper time-pickers">
        <picker mode="date" :value="datePart" @change="onDateChange">
          <view class="input-box">
            <text :class="{ 'placeholder': !datePart }">{{ datePart || timePlaceholder }}</text>
            <text class="arrow"></text>
          </view>
        </picker>
        <picker mode="time" :value="timePart" @change="onClockChange">
          <view class="input-box">
            <text :class="{ 'placeholder': !timePart }">{{ timePart || '选择具体时间' }}</text>
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
        <input class="input-box" v-model="form.color" placeholder="请输入物品颜色，如黑色、藏青色" placeholder-class="placeholder" />
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

      <!-- 底部安全占位 -->
      <view style="height: 60rpx;"></view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';
import { ref, reactive, computed } from 'vue';
import { saveItem, updateItem, getItemById } from '@/utils/storage.js';
import { validateForm } from '@/utils/validator.js';
import { formatCategory, formatStatus } from '@/utils/format.js';
import { CATEGORY_OPTIONS, CATEGORY_VALUES, LOCATION_TAGS, STATUS_OPTIONS, STATUS_VALUES } from '@/utils/constants.js';
import { fileToDataURL } from '@/utils/image.js';
import { backOrHome } from '@/utils/nav.js';

// 本页同时承担「新建发布」和「编辑」两种模式，由 storage 中的 edit_item_id 区分（见 onShow）
// 表单字段白名单：提交载荷、编辑回填都从这里取，字段增删只维护这一处
const PAYLOAD_FIELDS = ['category', 'itemName', 'locationTag', 'locationDetail', 'time', 'color', 'images', 'detail', 'status'];

// 空表单工厂：新建 / 复位时生成一份干净表单（images 每次都是新数组）
const createEmptyForm = () => ({
  category: '',
  itemName: '',
  locationTag: '',
  locationDetail: '',
  time: '',
  color: '',
  images: [],
  detail: '',
  status: 'ongoing'
});

const form = reactive(createEmptyForm());

const isSubmitting = ref(false);
const isEdit = ref(false);
const editId = ref(null);

// 让 picker 回显正确选中项：indexOf 未选中时返回 -1，用 Math.max(0, ...) 兜底为 0
const typeIndex = computed(() => Math.max(0, CATEGORY_VALUES.indexOf(form.category)));
const locationTagIndex = computed(() => Math.max(0, LOCATION_TAGS.indexOf(form.locationTag)));
const statusIndex = computed(() => Math.max(0, STATUS_VALUES.indexOf(form.status)));

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
const onStatusChange = (e) => { form.status = STATUS_VALUES[e.detail.value]; };

// 时间占位提示：寻物=丢失时间，招领=发现时间
const timePlaceholder = computed(() => form.category === 'lost' ? '请选择丢失时间' : '请选择发现时间');

// form.time 存为 "YYYY-MM-DD HH:mm"；拆分出日期/时间供两个 picker 回显
const datePart = computed(() => (form.time || '').split(' ')[0]);
const timePart = computed(() => (form.time || '').split(' ')[1] || '');

// 选日期：保留已选的时间部分，拼成 "YYYY-MM-DD HH:mm"
const onDateChange = (e) => {
  const d = e.detail.value;
  form.time = timePart.value ? d + ' ' + timePart.value : d;
};
// 选具体时间：保留已选的日期部分
const onClockChange = (e) => {
  const t = e.detail.value;
  form.time = datePart.value ? datePart.value + ' ' + t : t;
};

// 复位表单为「新建发布」状态（提交成功 / 取消时调用）
const resetForm = () => {
  Object.assign(form, createEmptyForm());
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
  display: flex;
  flex-direction: column;
  background-color: #F9F1E6;
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
  overflow-y: auto;
  padding: 40rpx 40rpx 0 40rpx;
  box-sizing: border-box;
}

.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.item-label {
  font-size: 28rpx;
  color: #333333;
  width: 120rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8rpx;
  padding-top: 20rpx;
}

.label-icon {
  font-size: 32rpx;
  line-height: 1;
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
  min-height: 160rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
}

.image-upload-area {
  width: 100%;
  height: 220rpx;
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

