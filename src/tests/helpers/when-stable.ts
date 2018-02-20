import { ComponentFixture } from '@angular/core/testing';

export function whenStable(fixture: ComponentFixture<any>): Promise<any> {
  fixture.autoDetectChanges();
  return fixture.whenStable();
}
