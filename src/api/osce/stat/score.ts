import { defHttp } from "@/request/axios";

enum Api {
  scoreDetailUrl = "/osce/examinations/{examinationId}/examinees/{examineeId}/details",
}

/**
 * 获取统计数据详情
 * @param examinationId 考试id
 * @param examineeId 考生id
 * @returns
 */
export const getScoreDetailApi = (examinationId: number, examineeId: number) =>
  defHttp.get({
    url: Api.scoreDetailUrl
      .replace("{examinationId}", `${examinationId}`)
      .replace("{examineeId}", `${examineeId}`),
  });
