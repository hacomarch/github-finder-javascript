class UI {
    constructor() {
        this.profile = document.getElementById('profile');
    }

    showProfile(user) {
        this.profile.innerHTML = `
        <div class="card card-body mb-3">
            <div class="row">
                <div class="col-md-3">
                    <img class="img-fluid mb-2" src="${user.avatar_url}">
                    <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View profile</a>
                </div>
                <div class="col-md-9">
                    <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
                    <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
                    <span class="badge badge-success">Followers: ${user.followers}</span>
                    <span class="badge badge-info">Following: ${user.following}</span>
                    <br><br>
                    <ul class="list-group">
                        <li class="list-group-item">Company: ${user.company}</li>
                        <li class="list-group-item">Website/Blog: ${user.blog}</li>
                        <li class="list-group-item">Location: ${user.location}</li>
                        <li class="list-group-item">Member Since: ${user.created_at}</li>
                    </ul>
                </div>
            </div>
        </div>
        <h3 class="page-heading mb-3">Latest Repos</h3>
        <div id="repos"></div>
        `;
    }

    showRepos(repos) {
        let output = '';

        repos.forEach(function (repo) {
            output += `
            <div class="card card-body mb-2">
                <div class="row">
                    <div class="col-md-6">
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    </div>
                    <div class="col-md-6">
                        <span class="badge badge-primary">Stars: ${repo.stargazers_count}</span>
                        <span class="badge badge-secondary">Watchers: ${repo.watchers_count}</span>
                        <span class="badge badge-success">Forks: ${repo.forks_count}</span>
                    </div>
                </div>
            </div>
            `;
        });
        output += `<b>Contributions in the 3 month</b>`

        document.getElementById('repos').innerHTML = output;
    }

    showUserPublicEvents(events) {
        // 기존 커밋 리스트를 클리어합니다.
        const commitListContainer = document.getElementById('commitListContainer');
        commitListContainer.innerHTML = '';

        const today = new Date();
        const startDate = new Date();
        startDate.setMonth(today.getMonth() - 3, 1); // 3개월 전의 첫 날로 설정

        // 모든 날짜에 대한 커밋 카운트를 초기화합니다.
        const commitCounts = {};
        for (let d = startDate; d < today; d.setDate(d.getDate() + 1)) {
            let date = new Date(d); // 새 Date 객체를 생성하여 부작용을 방지합니다.
            commitCounts[date.toISOString().split('T')[0]] = 0;
        }

        // 받은 이벤트 데이터로부터 커밋 수를 업데이트합니다.
        events.forEach(event => {
            if (event.type === 'PushEvent') {
                const date = event.created_at.split('T')[0];
                if (commitCounts.hasOwnProperty(date)) {
                    commitCounts[date] += event.payload.commits.length;
                }
            }
        });

        let currentMonth = -1;
        let monthContainer;

        Object.keys(commitCounts).forEach(date => {
            const count = commitCounts[date];
            const level = this.getCommitLevel(count);

            const cellDate = new Date(date);
            if (cellDate.getMonth() !== currentMonth) {
                // 새로운 월이 시작되면 새로운 monthContainer div를 생성합니다.
                currentMonth = cellDate.getMonth();
                monthContainer = document.createElement('div');
                monthContainer.className = 'month-container';
                commitListContainer.appendChild(monthContainer);

                // 월 이름을 monthContainer에 추가합니다.
                const monthName = cellDate.toLocaleString('en-US', { month: 'short' });
                const monthLabel = document.createElement('div');
                monthLabel.textContent = `${monthName}`;
                monthLabel.style.textAlign = 'center';
                monthLabel.style.gridColumn = 'span 7'; // 7일 주기의 그리드에 맞춤
                monthContainer.appendChild(monthLabel);
            }

            // 셀을 해당 월의 monthContainer에 추가합니다.
            const cell = document.createElement('div');
            cell.className = `contribution-cell level-${level}`;
            cell.title = `${date}: ${count} commits`;
            monthContainer.appendChild(cell);
        });
    }

    getCommitLevel(count) {
        if (count >= 10) {
            return '4'; // 진한 초록색
        } else if (count >= 5) {
            return '3'; // 중간 초록색
        } else if (count > 0) {
            return '2'; // 연한 초록색
        } else {
            return '1'; // 회색 (커밋 없음)
        }
    }

    showAlert(message, className) {
        this.clearAlert();

        const div = document.createElement('div');
        div.className = className;
        div.appendChild(document.createTextNode(message));

        const container = document.querySelector('.searchContainer');
        const search = document.querySelector('.search');
        container.insertBefore(div, search);

        setTimeout(() => {
            this.clearAlert();
        }, 3000);
    }

    clearAlert() {
        const currentAlert = document.querySelector('.alert');

        if (currentAlert) {
            currentAlert.remove();
        }
    }

    clearProfile() {
        this.profile.innerHTML = '';
    }

    clearUserPublicEvents() {
        const commitListContainer = document.getElementById('commitListContainer');
        if (commitListContainer) {
            commitListContainer.innerHTML = '';
        }
    }
}
