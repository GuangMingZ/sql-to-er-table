/**
 * ESLint 插件：禁止直接使用 localStorage，必须通过 localStorageUtil 操作
 */
export default {
  rules: {
    "no-direct-localstorage": {
      meta: {
        type: "problem",
        docs: {
          description:
            "不建议直接使用 localStorage，建议通过 localStorageUtil 操作",
          recommended: true,
        },
        fixable: "code",
        schema: [],
      },
      create(context) {
        // 检测直接使用 localStorage 的表达式
        function checkLocalStorage(node) {
          if (node.object && node.object.name === "localStorage") {
            context.report({
              node,
              message:
                "不建议直接使用 localStorage，请使用 localStorageUtil 替代",
            });
          }
        }

        return {
          // 监听 MemberExpression 节点，如 localStorage.setItem
          MemberExpression(node) {
            checkLocalStorage(node);
          },
          // 监听 CallExpression 节点，捕获更多可能的调用方式
          CallExpression(node) {
            if (node.callee.type === "MemberExpression") {
              checkLocalStorage(node.callee);
            }
          },
        };
      },
    },
  },
};
