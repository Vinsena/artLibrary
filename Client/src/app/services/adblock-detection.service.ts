import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdblockDetectionService {

  constructor() { }

  // added ads.js in index.html is required
  isAdblockEnabled() {
    const scriptElement = document.getElementById('adblock-test-script');
    if (!scriptElement) {
      throw new Error('Adblock checking doesn\'t work cause ads.js script isn\'t added');
    }
    return scriptElement && !document.getElementById('adBanner');
  }
}
