import { defHttp } from "@/request/axios";

enum Api {
  statisticsUrl = "/osce/examinations/{examinationId}/statistics",
  statisticsDetailUrl = "/osce/examinations/{examinationId}/criteria/{criteriaId}/statistics",
}

/**
 * 获取统计数据
 * @param examinationId 考试id
 * @returns
 */
export const getStatisticsApi = (examinationId: number) =>
  defHttp.get({
    url: Api.statisticsUrl.replace("{examinationId}", `${examinationId}`),
  });

/**
 * 获取统计数据详情
 * @param examinationId 考试id
 * @param skillId 技能id
 * @returns
 */
export const getStatisticsDetailApi = (
  examinationId: number,
  criteriaId: number,
) =>
  defHttp.get({
    url: Api.statisticsDetailUrl
      .replace("{examinationId}", `${examinationId}`)
      .replace("{criteriaId}", `${criteriaId}`),
  });
