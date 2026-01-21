/**
 * @fileoverview App Component Unit Tests
 * @see SPOT-27 Unit Tests Setup
 */
import { TestBed } from '@angular/core/testing';
import { App } from './app';

/**
 * Test suite for the root App component
 */
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  /**
   * Test: Component creation
   */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /**
   * Test: Template rendering
   */
  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, SpotiBye');
  });
});
