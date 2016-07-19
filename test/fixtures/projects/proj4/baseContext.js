class ContextObject {
  constructor(){
    this.seo = {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          content: 'IE=edge',
          props: [
            {
              prop: 'http-equiv',
              val: 'X-UA-Compatible'
            }
          ],
        },
        {
          props: [
            {
              prop: 'charset',
              val: 'UTF-8'
            }
          ],
        },
        {
          name: 'description',
          content: 'Starter lede project',
        },
      ],
      title: "Default lede project"
    };
  };
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextObject;