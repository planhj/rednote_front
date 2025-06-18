import request from "./request.js";

// 获取内容列表
export const getContentList = (params) => {
  return request({
    url: "/contents",
    method: "get",
    params,
  });
};

// 创建内容
export const createContent = (data) => {
  return request({
    url: "/contents/create",
    method: "post",
    data,
  });
};

// 编辑内容
export const editContent = (contentId, data) => {
  return request({
    url: `/contents/${contentId}/edit`,
    method: "put",
    data,
  });
};

// 删除内容
export const deleteContent = (contentId) => {
  return request({
    url: `/contents/${contentId}`,
    method: "delete",
  });
};

// 获取内容详情
export const getContentDetail = (contentId) => {
  return request({
    url: `/contents/${contentId}`,
    method: "get",
  });
};
