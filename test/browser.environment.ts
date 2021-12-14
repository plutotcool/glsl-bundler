import fs from 'fs-extra'
import JSDomEnvironment from 'jest-environment-jsdom'

export default class BrowserEnvironment extends JSDomEnvironment {
  async setup() {
    await super.setup();
    this.global.fetch = async (
      input: RequestInfo,
      init?: RequestInit
    ): Promise<Response> => ({
      text: async () => (await fs.readFile(input.toString())).toString()
    } as Response)
  }
}
