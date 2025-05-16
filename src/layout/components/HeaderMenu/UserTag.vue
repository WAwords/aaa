<template>
  <el-dropdown>
    <div class="user-tag">
      <el-avatar :size="25" :icon="UserFilled" />
      <span>{{ userStore.name }}</span>
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu popper-class="header-usertag-popper">
        <el-dropdown-item @click="handleChangeProfileClick">
          个人信息
        </el-dropdown-item>
        <el-dropdown-item @click="handleChangePasswordClick">
          修改密码
        </el-dropdown-item>
        <el-dropdown-item divided @click="handleLogoutClick">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 修改密码 -->
  <el-dialog
    v-model="passwordDialogVisible"
    title="修改密码"
    width="500px"
    @closed="onPasswordDialogClose"
    destroy-on-close
    align-center
  >
    <el-form
      :model="passwordDialogForm"
      label-width="100px"
      ref="passwordDialogFromRef"
      :rules="passwordDialogFormRules"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model.trim="passwordDialogForm.oldPassword"
          show-password
          clearable
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model.trim="passwordDialogForm.newPassword"
          show-password
          clearable
          @blur="newPasswordBlur"
        />
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="confirmPassword"
        ref="confirmPasswordRef"
      >
        <el-input
          v-model.trim="passwordDialogForm.confirmPassword"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handlePasswordDialogSubmit"
          :loading="passwordDialogLoading"
        >
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 修改用户信息 -->
  <el-dialog
    v-model="profileDialogVisible"
    title="个人信息"
    width="500px"
    @closed="onProfileDialogClose"
    destroy-on-close
    align-center
  >
    <el-form
      :model="profileDialogForm"
      label-width="100px"
      ref="profileDialogFromRef"
      :rules="profileDialogFormRules"
      v-loading="profileFormLoading"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="profileDialogForm.name" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select
          v-model="profileDialogForm.gender"
          placeholder="请选择性别"
          class="w-full"
          filterable
        >
          <el-option
            v-for="item in genderOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="识别号类型" prop="idType">
        <el-select
          v-model="profileDialogForm.idType"
          placeholder="请选择识别号类型"
          class="w-full"
          filterable
          disabled
        >
          <el-option
            v-for="item in idTypeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="唯一识别号" prop="idNumber">
        <el-input v-model.trim="profileDialogForm.idNumber" disabled />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model.trim="profileDialogForm.phoneNumber" />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="emailAddress">
        <el-input v-model.trim="profileDialogForm.emailAddress" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleProfileDialogSubmit"
          :loading="profileDialogLoading"
        >
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { UserFilled, ArrowDown } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import {
  userPatchPasswordApi,
  userPutProfileApi,
  getUserInfoApi,
} from "@/api/common";
import { copyObjectValue } from "@/utils/common";
import { getFormItemRule } from "@/utils/validate";

const router = useRouter();
const userStore = useUserStore();
const logout = () => {
  userStore
    .logout()
    .then(() => {
      router.push("/login");
    })
    .catch(() => {});
};
const handleLogoutClick = () => {
  CmeMessageBox.confirm("确定退出系统吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      logout();
    })
    .catch(() => {});
};

/** 识别号类型 */
const idTypeOption = [
  {
    value: "1",
    label: "身份证号",
  },
  {
    value: "9",
    label: "其他",
  },
];

/** 修改密码dialog控制 */
const passwordDialogVisible = ref(false);
/** 修改密码 */
const handleChangePasswordClick = () => {
  passwordDialogVisible.value = true;
};

const passwordDialogForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
/** 修改密码确定按钮加载状态 */
const passwordDialogLoading = ref(false);

const passwordDialogFromRef = ref();
/** 修改密码提交 */
const handlePasswordDialogSubmit = () => {
  passwordDialogLoading.value = true;
  passwordDialogFromRef.value
    .validate()
    .then(() => {
      userPatchPasswordApi(passwordDialogForm.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "修改密码成功",
            type: "success",
          });
          passwordDialogVisible.value = false;
        })
        .catch(() => {
          passwordDialogLoading.value = false;
        });
    })
    .catch(() => {
      passwordDialogLoading.value = false;
    });
};
/** 修改密码弹窗关闭 */
const onPasswordDialogClose = () => {
  passwordDialogLoading.value = false;
  passwordDialogFromRef.value.resetFields();
};

/** 修改用户信息dialog控制 */
const profileDialogVisible = ref(false);
/** 获取用户信息的加载状态 */
const profileFormLoading = ref(false);
/** 修改用户信息 */
const handleChangeProfileClick = () => {
  profileDialogVisible.value = true;
  profileFormLoading.value = true;
  getUserInfoApi()
    .then((res) => {
      copyObjectValue(profileDialogForm.value, res);
      profileFormLoading.value = false;
    })
    .catch(() => {
      profileFormLoading.value = false;
    });
};
/**  */
const profileDialogForm = ref({
  name: "",
  gender: "",
  idNumber: "",
  idType: "",
  phoneNumber: "",
  emailAddress: "",
});
/** 修改用户信息确定按钮加载状态 */
const profileDialogLoading = ref(false);
/**  */
const profileDialogFromRef = ref();
/** 修改用户信息提交 */
const handleProfileDialogSubmit = () => {
  profileDialogLoading.value = true;
  profileDialogFromRef.value
    .validate()
    .then(() => {
      userPutProfileApi(profileDialogForm.value)
        .then(() => {
          userStore
            .getUserInfo()
            .then(() => {
              profileDialogVisible.value = false;
              CmeMessage({
                title: "成功",
                message: "修改用户信息成功",
                type: "success",
              });
            })
            .catch(() => {});
        })
        .catch(() => {
          profileDialogLoading.value = false;
        });
    })
    .catch(() => {
      profileDialogLoading.value = false;
    });
};
/** 修改用户信息弹窗关闭 */
const onProfileDialogClose = () => {
  profileDialogLoading.value = false;
  profileDialogFromRef.value.resetFields();
};

const confirmPasswordRef = ref();
const newPasswordBlur = () => {
  // 确认密码如果校验失败，则重新进行校验
  if (confirmPasswordRef.value.validateMessage) {
    confirmPasswordRef.value.validate();
  }
};

/** 修改用户信息的校验规则 */
const profileDialogFormRules = {
  name: [
    { required: true, message: "请输入姓名", trigger: ["change"] },
    ...getFormItemRule("姓名", 50, -1, true),
  ],
  phoneNumber: [
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur"],
    },
  ],
  emailAddress: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入正确的邮箱",
      trigger: ["blur"],
    },
    ...getFormItemRule("邮箱", 64),
  ],
};

/** 修改密码的校验规则 */
const passwordDialogFormRules = {
  oldPassword: [
    { required: true, message: "请输旧密码", trigger: ["change"] },
    ...getFormItemRule("旧密码", 18, 6, true),
    {
      pattern: /^[A-Za-z0-9!@#$%^&*()_]*$/,
      message: "旧密码格式不正确",
      trigger: ["change"],
    },
  ],
  newPassword: [
    { required: true, message: "请输新密码", trigger: ["change"] },
    ...getFormItemRule("新密码", 18, 6, true),
    {
      pattern: /^[A-Za-z0-9!@#$%^&*()_]*$/,
      message: "新密码格式不正确",
      trigger: ["change"],
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: ["change"] },
    ...getFormItemRule("确认新密码", 18, 6, true),
    {
      pattern: /^[A-Za-z0-9!@#$%^&*()_]*$/,
      message: "确认新密码格式不正确",
      trigger: ["change"],
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        rule;
        value;
        if (
          passwordDialogForm.value.confirmPassword ===
          passwordDialogForm.value.newPassword
        ) {
          callback();
        } else {
          callback(new Error("两次密码不一致"));
        }
      },
      trigger: ["blur"],
    },
  ],
};

/** 字典 */
const genderOption = [
  {
    value: "1",
    label: "男",
  },
  {
    value: "2",
    label: "女",
  },
];
</script>

<style lang="less" scoped>
.user-tag {
  @apply flex items-center justify-center ml-12px cursor-pointer;
  outline: none;
  gap: 8px;
}

:global(.el-popper ul[popper-class="header-usertag-popper"]) {
  overflow: hidden;
}
</style>
