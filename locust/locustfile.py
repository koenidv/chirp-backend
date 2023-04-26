import random

from locust import HttpUser, task, between

USER_CRENDENTIALS = [
    ["testuser1@test.user", "testuser1"],
    ["testuser2@test.user", "testuser2"],
    ["testuser3@test.user", "testuser3"],
    ["testuser4@test.user", "testuser4"],
    ["testuser5@test.user", "testuser5"],
    ["testuser6@test.user", "testuser6"],
    ["testuser7@test.user", "testuser7"],
    ["testuser8@test.user", "testuser8"],
    ["testuser9@test.user", "testuser9"],
    ["testuser10@test.user", "testuser10"],
    ["testuser11@test.user", "testuser11"],
    ["testuser12@test.user", "testuser12"],
    ["testuser13@test.user", "testuser13"],
    ["testuser14@test.user", "testuser14"],
    ["testuser15@test.user", "testuser15"],
]


def randomUsername():
    return "testuser" + str(random.randrange(1, 15))


class ExistingUser(HttpUser):
    wait_time = between(1, 5)
    print()
    auth = {}
    refreshtoken = ""

    def on_start(self):
        creds = USER_CRENDENTIALS.pop()
        response = self.client.post("/auth/login", json={"email": creds[0], "password": creds[1]}).json()
        self.auth = {"Authorization": "Bearer " + response["jwt"]}
        self.refreshtoken = response["refreshToken"]

    @task(100)
    def feed(self):
        self.client.get("/tweet", headers=self.auth)

    @task(50)
    def extendedFeed(self):
        self.client.get("/tweet/extend", headers=self.auth)

    @task(40)
    def createPost(self):
        self.client.post("/tweet",
                         json={"content": "This post was created by locust. " + str(random.randrange(1000))},
                         headers=self.auth)

    @task(40)
    def randomUser(self):
        self.client.get("/user/%s" % randomUsername(), headers=self.auth)

    @task(25)
    def subscribeRandom(self):
        self.client.post("/user/%s/follow" % randomUsername(), json=True, headers=self.auth)

    @task(15)
    def unsubscribeRandom(self):
        self.client.post("/user/%s/follow" % randomUsername(), json=False, headers=self.auth)

    @task(100)
    def checkFollowsRandom(self):
        self.client.get("/user/%s/follow" % randomUsername(), headers=self.auth)

    @task(1)
    def refreshToken(self):
        self.client.post("/auth/refresh", json={"refreshToken": self.refreshtoken})

    @task(15)
    def searchRandom(self):
        self.client.get("/search/users/%s" % randomUsername(), headers=self.auth)

    @task(100)
    def usernameTakenRandom(self):
        self.client.get("/user/istaken/%s" % randomUsername(), headers=self.auth)
