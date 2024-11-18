import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class MaccabiService {
  private client: ReturnType<typeof wrapper>;
  private cookieJar: CookieJar;

  constructor() {
    this.cookieJar = new CookieJar(undefined, {
      allowSpecialUseDomain: true,
      looseMode: true,
    });

    this.client = wrapper(
      axios.create({
        jar: this.cookieJar,
        withCredentials: true,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
        },
      }),
    );
  }

  async chooseTreatment(treatmentId: number) {
    try {
      const response = await this.client.post(
        'https://tivi.maccabi4u.co.il/personal/,DanaInfo=.aoovyC57+choose',
        {
          maxRedirects: 0,
          data: {
            treatM: treatmentId,
          },
        },
      );

      console.log('Response:', response);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async getMyTreatmentsList() {
    try {
      const mainFunctions = await this.client.post(
        'https://tivi.maccabi4u.co.il/personal/,DanaInfo=.aoovyC57+choose',
        {
          maxRedirects: 0,
        },
      );

      const $ = cheerio.load(mainFunctions.data);

      const treatmentsList = [];
      $('.zt-proceduresSide li').each((_, element) => {
        const onclick = $(element).find('a').attr('onclick');
        const match = onclick?.match(
          /setTreatM\((\d+),(\d+),'([^']+)','([^']+)'/,
        );

        if (match) {
          const displayName = $(element).text().trim();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, id, code, name, imagePath] = match;
          treatmentsList.push({
            id: parseInt(id),
            code: parseInt(code),
            name,
            imagePath,
            displayName,
          });
        }
      });
      let ajaxActions = '';
      $('script').each((_, element) => {
        const scriptContent = $(element).toString();
        const regex = /\$\.(ajax)\(\{[\s\S]*?\}\);/g;
        const matches = scriptContent.match(regex);
        ajaxActions += matches;
        // if (matches) ajaxActions.push(...matches);
      });

      const regexUrls = /url:\s*"\/umbracoadm\/surface\/WS\/([^"]+)"/g;
      const matches = [...ajaxActions.matchAll(regexUrls)];
      const urls = matches.map((match) => match[1]);

      console.log(urls);

      const authRegex = /'Authorization':\s*'([^']+)'/g;
      const authMatches = [...ajaxActions.matchAll(authRegex)];
      const authHeaders = authMatches.map((match) => match[1]);

      console.log(authHeaders);

      const getClients = await this.client.post(
        `https://tivi.maccabi4u.co.il/umbracoadm/surface/WS/,DanaInfo=.aoovyC57,dom=1,CT=sxml+${urls[1]}`,
        { tipulId: 12 },
        {
          headers: {
            Authorization: authHeaders[1],
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(getClients);

      const dt = new Date().getTime();
      console.log(dt);

      // const str = JSON.stringify({
      //   tipulId: 12,
      //   compId: 46,
      //   yomanId: '0',
      //   date: dt,
      // });
      // console.log(str);

      const GetTherapists = await this.client.post(
        `https://tivi.maccabi4u.co.il/umbracoadm/surface/WS/,DanaInfo=.aoovyC57,dom=1,CT=sxml+${urls[2]}`,
        { tipulId: 172, compId: 46, yomanId: '', date: '19/11/2024' },
        {
          headers: {
            Authorization: authHeaders[2],
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(GetTherapists.data);

      return treatmentsList;
    } catch (error) {
      throw error;
    }
  }

  async _getCurrentCookies() {
    try {
      const cookies = await this.cookieJar.getCookies(
        'https://tivi.maccabi4u.co.il',
      );
      console.log('Raw cookies:', cookies);
      return cookies;
    } catch (error) {
      console.error('Error getting cookies:', error);
      return [];
    }
  }

  async loginToMaccabi(userId: string, password: string) {
    try {
      await this.client.get(
        'https://tivi.maccabi4u.co.il/dana-na/auth/url_shdqSxnN3nT3jat5/welcome.cgi',
      );

      console.log('Welcome cookies:', await this._getCurrentCookies());

      const formData = new URLSearchParams({
        tz_offset: '',
        IDCode: '0',
        username: `0-${userId}`,
        password: password,
        username1: '',
        realm: 'Maccabi-Online',
      });

      const loginResponse = await this.client.post(
        'https://tivi.maccabi4u.co.il/dana-na/auth/url_shdqSxnN3nT3jat5/login.cgi',
        formData,
        {
          maxRedirects: 0,
          validateStatus: (status) => {
            return status === 302;
          },
        },
      );

      console.log('Status:', loginResponse.status);
      console.log('Location header:', loginResponse.headers.location);

      if (loginResponse.headers.location.includes('failed')) {
        throw new Error('Login failed');
      }

      return { success: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
