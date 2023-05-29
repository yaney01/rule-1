const okk = JSON.parse($response.body);
if (/imrobot\/v1\/pub\/relation\/get_robot_list/.test($request.url)) {
  okk.data.robot_info.forEach((robot) => {
robot.friend_bg_img = `https://raw.githubusercontent.com/Keywos/rule/main/mocks/bd/robot${Math.floor(Math.random() * 12) + 1}.jpg`;
  });
} else if (/v5\/custom_page\/layout/.test($request.url)) {
  const keyi=["功能入口","表情图标iOSan","一丢儿颜文字标题栏-iOSan","活动中心标题栏iOS","字体banner",];
  const keys = ["字体banner", "活动中心标题栏iOS"];
  if (okk.data.page_layout_content && Array.isArray(okk.data.page_layout_content)) {
    okk.data.page_layout_content = okk.data.page_layout_content.filter(
      ({ module_desc }) => keyi.includes(module_desc)
    );}
  if (okk.data.page_data_content && Array.isArray(okk.data.page_data_content)) {
    okk.data.page_data_content = okk.data.page_data_content.filter(
      ({ module_desc }) => keyi.includes(module_desc)
    );
    okk.data.page_data_content = okk.data.page_data_content.filter(
      (module) => !keys.some((keyword) => module.module_desc.includes(keyword))
    );
  }
} else if (/v5\/custom_page\/getdata/.test($request.url)) {
  if (okk.data && Array.isArray(okk.data)) {
    okk.data.forEach((item) => {
      if (item.items) {
        item.items = [];
      }
    });
  }
}
$done({ body: JSON.stringify(okk) });
