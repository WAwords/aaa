<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-img"></div>
      <div class="card-data">
        <img src="@/assets/img/logo/cme-mix.png" alt="" class="h-45px" />
        <div class="welcome ali-font">欢迎登录</div>
        <el-form
          :model="form"
          ref="formRef"
          :rules="rules"
          class="card-form"
          label-position="top"
        >
          <el-form-item prop="username" label="账号">
            <el-input
              v-model.trim="form.username"
              placeholder="请输入账号"
              clearable
              @keyup.enter="handleSubmit"
              style="height: 48px"
            />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input
              v-model.trim="form.password"
              placeholder="请输入密码"
              type="password"
              show-password
              clearable
              @keyup.enter="handleSubmit"
              style="height: 48px"
            />
          </el-form-item>
          <el-form-item prop="code" label="验证码" v-if="captchaMsg.enabled">
            <el-input
              v-model.trim="form.code"
              placeholder="请输入验证码"
              clearable
              @keyup.enter="handleSubmit"
              style="height: 48px"
              class="code-input"
              :disabled="!captchaMsg.enabled"
            >
              <template #append>
                <div
                  class="code-img-box"
                  @click="fetchCaptcha()"
                  v-loading="captchaLoading"
                >
                  <img :src="captchaMsg.image" />
                </div>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="flex justify-center w-full">
              <el-button
                type="primary"
                @click="handleSubmit"
                class="w-full mt-30px"
                style="height: 48px"
                :loading="loading"
              >
                登录
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="footer-msg">
      四川福济生鸿医疗科技有限公司 版权所有
      <span style="margin: 0 10px">/</span>
      云医教
      <span style="margin: 0 10px">/</span>
      {{ PackageJson.version }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { SystemTokensType, systemCaptchasApi } from "@/api/common/index";
import type { CaptchaMsgType } from "@/api/common/index";
import { useUserStore } from "@/store/modules/user";
import PackageJson from "@/../package.json";

/** =============== 验证码 begin =============== */
const captchaLoading = ref(false);
const captchaMsg = ref<CaptchaMsgType>({ enabled: false, image: "" });

onMounted(() => {
  fetchCaptcha();
});

/** 请求验证码 */
const fetchCaptcha = () => {
  return new Promise<void>((resolve, reject) => {
    captchaLoading.value = true;
    systemCaptchasApi()
      .then((res) => {
        captchaMsg.value = res;

        // 赋值uuid
        form.value.uuid = res.uuid || "";

        captchaLoading.value = false;

        resolve();
      })
      .catch(() => {
        captchaLoading.value = false;

        reject();
      });
  });
};
/** =============== 验证码 end =============== */

const form = ref<SystemTokensType>({
  username: "",
  password: "",
  code: "",
  uuid: "",
});
const formRef = ref();

// 提交
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const handleSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      loading.value = true;
      useUserStore()
        .login(form.value)
        .then(() => {
          loading.value = false;
          // 如果有redirect，则跳转到redirect，否则跳转到首页
          if (route.query.redirect) {
            router.push(route.query.redirect as string);
          } else {
            router.push("/");
          }
        })
        .catch(async () => {
          // 清除验证码
          form.value.code = "";
          form.value.uuid = "";
          await fetchCaptcha();

          loading.value = false;
        });
    })
    .catch(() => {});
};

// 校验
const rules = {
  username: [...getFormItemRule("账号", 64, -1, true)],
  password: [...getFormItemRule("密码", -1, -1, true)],
  code: [...getFormItemRule("验证码", -1, -1, true)],
};
</script>

<style scoped lang="less">
.login-container {
  @apply h-full w-full flex justify-center items-center;
  @apply bg-no-repeat bg-cover bg-origin-border bg-right;
  background-image: url(@/assets/img/osce/login/login_bg.png);
  font-weight: Regular;
  .login-card {
    @apply w-1200px h-720px bg-white box-border overflow-hidden flex flex-none;
    border-radius: 8px;
    border: 1px solid #eaebef;
    .card-img {
      @apply w-720px h-full flex-none;
      @apply bg-no-repeat bg-cover bg-origin-border bg-right;
      background-image: url(@/assets/img/osce/login/login-card.png);
    }
    .card-data {
      @apply flex-1 p-60px box-border;
      color: #25334e;
      .welcome {
        @apply text-30px mt-50px;
      }
      .card-form {
        @apply mt-40px;

        // label字体加粗
        ::v-deep(.el-form-item__label) {
          font-weight: bold;
          color: #25334e;
        }
      }
    }
  }

  .footer-msg {
    position: fixed;
    bottom: 20px;
    color: var(--el-text-color-regular);
  }
}

// 输入框padding
::v-deep(.el-input__wrapper) {
  padding: 1px 20px;
}

// 验证码框
::v-deep(.el-form-item) {
  .code-input {
    .el-input__wrapper {
      box-shadow: 0 1px 0 0 var(--el-input-border-color) inset,
        0 -1px 0 0 var(--el-input-border-color) inset,
        1px 0 0 0 var(--el-input-border-color) inset;
    }

    .el-input-group__append {
      @apply bg-transparent p-2px;
      transition: 0.3s;
      .code-img-box {
        @apply w-140px h-full overflow-hidden cursor-pointer;
        border-radius: 6px;
        @apply bg-no-repeat bg-cover;
        background-color: var(--el-color-primary-light-8);
      }
    }
  }

  &.is-error {
    .code-input {
      .el-input__wrapper {
        box-shadow: 0 1px 0 0 var(--el-color-danger) inset,
          0 -1px 0 0 var(--el-color-danger) inset,
          1px 0 0 0 var(--el-color-danger) inset;
      }

      .el-input-group__append {
        box-shadow: 0 1px 0 0 var(--el-color-danger) inset,
          0 -1px 0 0 var(--el-color-danger) inset,
          -1px 0 0 0 var(--el-color-danger) inset;
      }
    }
  }
}
</style>
