import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as df_en from 'date-fns/locale/en';
import * as df_zh_cn from 'date-fns/locale/zh_cn';

import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class I18NService {
  get default(): string {
    return this._default;
  }

  set default(value: string) {
    this._default = value;
  }
  private _default = 'zh-CN';
  private change$ = new BehaviorSubject<string>(null);

  private _langs = [
    {code: 'en', text: 'English'},
    {code: 'zh-CN', text: '中文'},
  ];

  constructor(
    private nzI18nService: NzI18nService,
    private translateSrv: TranslateService,
    private logger: NGXLogger
  ) {
    const defaultLan = 'zh-CN' || translateSrv.getBrowserLang();
    const lans = this._langs.map(item => item.code);
    this.default = lans.includes(defaultLan) ? defaultLan : lans[0];
    translateSrv.addLangs(lans);
    this.setZorro(this.default).setDateFns(this.default);
  }

  setZorro(lang: string): this {
    this.nzI18nService.setLocale(lang === 'en' ? en_US : zh_CN);
    return this;
  }

  setDateFns(lang: string): this {
    (window as any).__locale__ = lang === 'en' ? df_en : df_zh_cn;
    return this;
  }

  get change(): Observable<string> {
    return this.change$.asObservable().pipe(filter(w => w != null));
  }

  use(lang: string): void {
    lang = lang || this.translateSrv.getDefaultLang();
    if (this.currentLang === lang) {
      return;
    }
    this.setZorro(lang).setDateFns(lang);
    this.translateSrv.use(lang).subscribe(() => this.change$.next(lang));
  }

  /** 获取语言列表 */
  getLangs() {
    return this._langs;
  }

  /** 翻译 */
  translate(key: string) {
    return this.translateSrv.instant(key);
  }

  /** 默认语言 */
  get defaultLang() {
    return this.default;
  }

  /** 当前语言 */
  get currentLang() {
    return (
      this.translateSrv.currentLang ||
      this.translateSrv.getDefaultLang() ||
      this._default
    );
  }
}
