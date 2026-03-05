import { jest } from '@jest/globals';

// Mock fetch globally
const fetchMock = jest.fn();
global.fetch = fetchMock;

describe('gitlab-issue-link.js', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    document.body.innerHTML = '';
  });

  it('should only make one REST request per unique issue ID even if multiple links exist', async () => {
    // Setup DOM with two links to the same issue
    const issueId = '12345';
    document.body.innerHTML = `
      <a class="ref-container" href="/issue/project-${issueId}"></a>
      <a class="ref-container" href="/issue/project-${issueId}"></a>
    `;

    // Mock fetch response
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        title: 'Test Issue',
        field_issue_status: 1,
        field_issue_assigned: { uri: 'https://www.drupal.org/user/1' }
      })
    });
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ name: 'Test User' })
    });

    // Import the script (should trigger the logic)
    await import('./gitlab-issue-link.js');

    // Only one request to the issue node endpoint should be made
    const issueNodeCalls = fetchMock.mock.calls.filter(call => call[0].includes(`/node/${issueId}.json`));
    expect(issueNodeCalls.length).toBe(1);
  });

  it('fails if duplicate requests are made for the same issue ID', async () => {
    // Setup DOM with two links to the same issue
    const issueId = '12345';
    document.body.innerHTML = `
      <a class="ref-container" href="/issue/project-${issueId}"></a>
      <a class="ref-container" href="/issue/project-${issueId}"></a>
    `;

    // Mock fetch response
    fetchMock.mockResolvedValue({
      json: async () => ({
        title: 'Test Issue',
        field_issue_status: 1,
        field_issue_assigned: { uri: 'https://www.drupal.org/user/1' }
      })
    });

    // Import the script (should trigger the logic)
    await import('./gitlab-issue-link.js');

    // If more than one request is made, fail
    const issueNodeCalls = fetchMock.mock.calls.filter(call => call[0].includes(`/node/${issueId}.json`));
    if (issueNodeCalls.length > 1) {
      throw new Error('Duplicate REST requests made for the same issue ID');
    }
  });
});
