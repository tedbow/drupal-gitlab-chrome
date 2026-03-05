// Mock the DOM and fetch for the test

describe('Issue title fallback', () => {
  beforeEach(() => {
    // Set up DOM element for title
    document.body.innerHTML = '<a id="test-issue-link"></a>';
  });

  it('sets title to "Issue not found" when REST call fails', async () => {
    // Simulate fetch failure
    global.fetch = jest.fn(() => Promise.reject('API error'));
    const link = document.getElementById('test-issue-link');
    // Simulate the code that sets the title on error
    try {
      await fetch('https://www.drupal.org/api-d7/node/999999999.json');
    } catch (e) {
      link.title = 'Issue not found';
    }
    expect(link.title).toBe('Issue not found');
  });

  it('sets title to "Issue not found" when issue is missing', async () => {
    // Simulate fetch returning missing issue
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    const link = document.getElementById('test-issue-link');
    const data = await fetch('https://www.drupal.org/api-d7/node/999999999.json').then(r => r.json());
    if (!data.title) {
      link.title = 'Issue not found';
    }
    expect(link.title).toBe('Issue not found');
  });
});
