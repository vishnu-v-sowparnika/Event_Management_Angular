import { EventManagementTemplatePage } from './app.po';

describe('EventManagement App', function() {
  let page: EventManagementTemplatePage;

  beforeEach(() => {
    page = new EventManagementTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
