import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Security } from '../models/security';
import { SECURITIES } from '../mocks/securities-mocks';
import { SecuritiesFilter } from '../models/securities-filter';

export interface SecuritiesResponse {
  data: Security[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  /**
   * Get Securities server request mock
   * */
  getSecurities(securityFilter?: SecuritiesFilter): Observable<SecuritiesResponse> {
    const filteredSecurities = this._filterSecurities(securityFilter);
    const skip = securityFilter?.skip ?? 0;
    const limit = securityFilter?.limit ?? 100;

    const paginatedSecurities = filteredSecurities.slice(skip, skip + limit);

    const response: SecuritiesResponse = {
      data: paginatedSecurities,
      total: filteredSecurities.length,
    };

    return of(response).pipe(delay(1000));
  }

  private _filterSecurities(
    securityFilter: SecuritiesFilter | undefined
  ): Security[] {
    if (!securityFilter) return SECURITIES;

    return SECURITIES.filter(
      (s) =>
        (!securityFilter.name || s.name.toLowerCase().includes(securityFilter.name.trim().toLowerCase())) &&
        (!securityFilter.type ||
          securityFilter.type.some((type) => s.type === type)) &&
        // (!securityFilter.currency ||
        //   securityFilter.currency.some(
        //     (currency) => s.currency == currency
        //   )) &&
        (securityFilter.currency === undefined || securityFilter.currency === s.currency) &&
        (securityFilter.isPrivate === undefined ||
          securityFilter.isPrivate === s.isPrivate)
    );
  }
}
