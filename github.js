class Github {
    constructor() {
        this.access_token = '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'
        this.repos_count = 5;
        this.repos_sort = 'created: asc';
    }

    async getUser(user) {
        const profileResponse = 
            await fetch(
                `https://api.github.com/users/${user}`, {
                    headers: {
                        'Authorization' : `Bearer ${this.access_token}`
                    }
                }
            );

        const rateLimitRemaining = profileResponse.headers.get('X-RateLimit-Remaining');
        console.log(`Rate Limit Remaining: ${rateLimitRemaining}`);

        const repoResponse = 
            await fetch(
                `https://api.github.com/users/${user}/repos?per_page=${this.repos_count}&sort=${this.repos_sort}`, {
                    headers: {
                        'Authorization' : `Bearer ${this.access_token}`
                    }
                }
            );

        const profile = await profileResponse.json();
        const repos = await repoResponse.json();

        return {
            profile,
            repos
        }
    }

    async getUserPublicEvents(user) {
        const events = [];
        let page = 1;
        const perPage = 100;

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const since = threeMonthsAgo.toISOString();

        while(page) {
            const url = `https://api.github.com/users/${user}/events/public?per_page=${perPage}&page=${page}&since=${since}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization' : `Bearer ${this.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API request failed with status: ${response.status}`);
            }

            const pageEvents = await response.json();
            if (pageEvents.length === 0) {
                // 더 이상 가져올 이벤트가 없으면 종료합니다.
                break;
            }

            events.push(...pageEvents);
            const linkHeader = response.headers.get('Link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
                page++; // 다음 페이지가 있으면 페이지 번호를 증가시킵니다.
            } else {
                page = 0; // 다음 페이지가 없으면 반복을 종료합니다.
            }
        }

        // 한 달 전보다 이후의 이벤트만 필터링하여 반환합니다.
        return events.filter(event => {
            const eventDate = new Date(event.created_at);
            return eventDate >= threeMonthsAgo;
        });
    }
}
