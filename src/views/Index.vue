<template>
  <b-container style="padding: 20px 190px 0 190px">
    <b-row class="margin-b40">
      <b-col md="12" class="text-center">
        <b-form-group label="Загрузить файлы матча" label-for="file-default" label-cols-md="2">
          <b-form-file v-model="loadedFiles" accept=".dat" multiple @input="parseMatchData"
                       placeholder="Если был разрыв,выбирайте несколько файлов" class="text-nowrap text-truncate shadow-none"></b-form-file>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row class="margin-b40">
      <b-col md="12" class="text-center">
        <b-button variant="light" @click="swapTeams($event)">
          <b-icon-arrow-left-right></b-icon-arrow-left-right>
          <b>Поменять команды местами</b>
        </b-button>
      </b-col>
    </b-row>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>ОБЩИЙ СЧЕТ МАТЧА (ВКЛЮЧАЯ ДОП. ВРЕМЯ)</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row align-items-center margin-b20">
      <b-col md="4">
        <b-form-select v-model.number="matchData.homeTeamId" :options="selectTeamOptions"
                       v-on:change="changeHomeTeam(matchData.homeTeamId)"></b-form-select>
      </b-col>
      <b-col md="4">
        <div class="d-flex flex-row align-items-center">
          <b-col md="5">
            <b-form-input v-model.number="matchData.homeTeamTotalScore" type="number" v-on:change="onChangeHomeTeamTotalScore"
                          min="0"></b-form-input>
          </b-col>
          <b-col md="2">:</b-col>
          <b-col md="5">
            <b-form-input v-model.number="matchData.guestTeamTotalScore" type="number"
                          min="0" v-on:change="onChangeGuestTeamTotalScore"></b-form-input>
          </b-col>
        </div>
      </b-col>
      <b-col md="4">
        <b-form-select v-model.number="matchData.guestTeamId" :options="selectTeamOptions"
                       v-on:change="changeGuestTeam(matchData.guestTeamId)"></b-form-select>
      </b-col>
    </div>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>ДОПОЛНИТЕЛЬНОЕ ВРЕМЯ</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row justify-content-center margin-b20">
      <b-col md="4">
        <div class="d-flex flex-row align-items-center">
          <b-col md="5">
            <b-form-input v-model.number="matchData.homeTeamExtraTimeScore" :min="0"
                          type="number" :max="matchData.homeTeamTotalScore"
                          v-on:input="checkOnChangeExtraScore(sides.home)"></b-form-input>
          </b-col>
          <b-col md="2">:</b-col>
          <b-col md="5">
            <b-form-input v-model.number="matchData.guestTeamExtraTimeScore" :min="0"
                          type="number" :max="matchData.guestTeamTotalScore"
                          v-on:input="checkOnChangeExtraScore(sides.guest)"></b-form-input>
          </b-col>
        </div>
      </b-col>
    </div>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>СЕРИЯ ПЕНАЛЬТИ</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row justify-content-center margin-b40">
      <b-col md="4">
        <div class="d-flex flex-row align-items-center">
          <b-col md="5">
            <b-form-input v-model.number="matchData.homeTeamPenaltiesScore" :min="0"
              type="number" v-on:input="checkOnChangePenaltiesScore(sides.home)"></b-form-input>
          </b-col>
          <b-col md="2">:</b-col>
          <b-col md="5">
            <b-form-input v-model.number="matchData.guestTeamPenaltiesScore" :min="0"
              type="number" v-on:input="checkOnChangePenaltiesScore(sides.guest)"></b-form-input>
          </b-col>
        </div>
      </b-col>
    </div>
    <div v-if="matchData.homeTeamTotalScore > 0 || matchData.guestTeamTotalScore > 0">
      <b-row class="margin-b20">
        <b-col md="12" class="text-center">
          <b>АВТОРЫ ГОЛОВ</b>
        </b-col>
      </b-row>
      <div class="d-flex flex-row margin-b20 justify-content-between">
        <b-col md="6" class="pl-0">
          <div class="d-flex flex-column">
            <div class="d-flex flex-row margin-b20 justify-content-start" v-for="(val, i) in matchData.homeTeamGoals"
                 :key="i">
              <b-col md="7">
                <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="homeTeamGoals"
                 :options="selectHomeTeamGoalsOptions" v-on:change="checkDataOnMerge(i, 'homeTeamGoals')"></b-form-select>
              </b-col>
              <b-col md="3" >
                <b-form-input v-model.number="val.count" type="number" min="1"
                  :max="matchData.homeTeamTotalScore" v-on:change="checkGoalsByChangedCount(i, sides.home)"></b-form-input>
              </b-col>
            </div>
          </div>
        </b-col>
        <b-col md="6" class="pr-0">
          <div class="d-flex flex-column">
            <div class="d-flex flex-row margin-b20 justify-content-end" v-for="(val, i) in matchData.guestTeamGoals" :key="i">
              <b-col md="7">
                <b-form-select v-model.number="val.playerId"
                  :options="selectGuestTeamGoalsOptions" ref="guestTeamGoals" :class="{'is-invalid': val.playerId === null}"
                               v-on:change="checkDataOnMerge(i, 'guestTeamGoals')"></b-form-select>
              </b-col>
              <b-col md="3" >
                <b-form-input v-model.number="val.count" type="number" min="1"
                  :max="matchData.guestTeamTotalScore" v-on:change="checkGoalsByChangedCount(i, sides.guest)"></b-form-input>
              </b-col>
            </div>
          </div>
        </b-col>
      </div>
      <b-row class="margin-b20">
        <b-col md="12" class="text-center">
          <b>АССИСТЫ</b>
        </b-col>
      </b-row>
      <div class="d-flex flex-row margin-b20">
        <b-col md="6" class="pl-0">
          <div class="d-flex flex-column">
            <div class="d-flex flex-row margin-b20 justify-content-center">
              <img :src="img.plus" v-on:click="addAssist(sides.home)"/>
            </div>
            <div class="d-flex flex-row margin-b20 justify-content-start" v-for="(val, i) in matchData.homeTeamAssists"
                 :key="i">
              <b-col md="7">
                <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="homeTeamAssists"
                  @change="checkDataOnMerge(i, 'homeTeamAssists')" :options="selectHomeTeamPlayerOptions"></b-form-select>
              </b-col>
              <b-col md="3" >
                <b-form-input v-model.number="val.count" type="number" min="1"
                  :max="matchData.homeTeamTotalScore"></b-form-input>
              </b-col>
              <b-col md="1" class="align-self-center">
                <img :src="img.delete" v-on:click="deleteAssist(i, sides.home)"/>
              </b-col>
            </div>
          </div>
        </b-col>
        <b-col md="6" class="pr-0">
          <div class="d-flex flex-column">
            <div class="d-flex flex-row margin-b20 justify-content-center">
              <img :src="img.plus" v-on:click="addAssist(sides.guest)"/>
            </div>
            <div class="d-flex flex-row margin-b20 justify-content-end" v-for="(val, i) in matchData.guestTeamAssists" :key="i">
              <b-col md="1" class="align-self-center">
                <img :src="img.delete" v-on:click="deleteAssist(i, sides.guest)"/>
              </b-col>
              <b-col md="7">
                <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="guestTeamAssists"
                  @change="checkDataOnMerge(i, 'guestTeamAssists')" :options="selectGuestTeamPlayerOptions"></b-form-select>
              </b-col>
              <b-col md="3">
                <b-form-input v-model.number="val.count" type="number" min="1"
                  :max="matchData.guestTeamTotalScore"></b-form-input>
              </b-col>
            </div>
          </div>
        </b-col>
      </div>
    </div>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>КАРТОЧКИ</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row margin-b20">
      <b-col md="6" class="pl-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-center">
            <img :src="img.yellowCard" v-on:click="addCard(cards.yellow, sides.home)"/>
            <img :src="img.redCard" v-on:click="addCard(cards.red, sides.home)"/>
          </div>
          <div class="d-flex flex-row margin-b20 justify-content-start" v-for="(val, i) in matchData.homeTeamCards"
               :key="i">
            <b-col md="7">
              <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="homeTeamCards"
                             :options="selectHomeTeamPlayerOptions" v-on:change="checkCardsOnDuplicate(i, sides.home)"></b-form-select>
            </b-col>
            <b-col md="1" class="align-self-center pl-0">
              <img :src="val.type === cards.yellow ? img.yellowCard : img.redCard"/>
            </b-col>
            <b-col md="1" class="align-self-center">
              <img :src="img.delete" v-on:click="deleteCard(i, sides.home)"/>
            </b-col>
          </div>
        </div>
      </b-col>
      <b-col md="6" class="pr-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-center">
            <img :src="img.yellowCard" v-on:click="addCard(cards.yellow, sides.guest)"/>
            <img :src="img.redCard" v-on:click="addCard(cards.red, sides.guest)"/>
          </div>
          <div class="d-flex flex-row margin-b20 justify-content-end" v-for="(val, i) in matchData.guestTeamCards"
               :key="i">
            <b-col md="1" class="align-self-center pl-0">
              <img :src="img.delete" v-on:click="deleteCard(i, sides.guest)"/>
            </b-col>
            <b-col md="1" class="align-self-center pr-0">
              <img :src="val.type === cards.yellow ? img.yellowCard : img.redCard"/>
            </b-col>
            <b-col md="7">
              <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="guestTeamCards"
                :options="selectGuestTeamPlayerOptions" v-on:change="checkCardsOnDuplicate(i, sides.guest)"></b-form-select>
            </b-col>
          </div>
        </div>
      </b-col>
    </div>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>ТРАВМЫ</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row margin-b20">
      <b-col md="6" class="pl-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-center">
            <img :src="img.lightInjury" v-on:click="addInjury(injuries.light, sides.home)" style="margin-right: 3px"/>
            <img :src="img.heavyInjury" v-on:click="addInjury(injuries.heavy, sides.home)"/>
          </div>
          <div class="d-flex flex-row margin-b20 justify-content-start" v-for="(val, i) in matchData.homeTeamInjuries"
               :key="i">
            <b-col md="7">
              <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="homeTeamInjuries"
                 :options="selectHomeTeamPlayerOptions" v-on:change="checkInjuriesOnDuplicate(i, sides.home)"></b-form-select>
            </b-col>
            <b-col md="1" class="align-self-center pl-0">
              <img :src="val.type === injuries.light ? img.lightInjury : img.heavyInjury"/>
            </b-col>
            <b-col md="1" class="align-self-center">
              <img src="delete.png" v-on:click="deleteInjury(i, sides.home)"/>
            </b-col>
          </div>
        </div>
      </b-col>
      <b-col md="6" class="pr-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-center">
            <img :src="img.lightInjury" v-on:click="addInjury(injuries.light, sides.guest)" style="margin-right: 3px"/>
            <img :src="img.heavyInjury" v-on:click="addInjury(injuries.heavy, sides.guest)"/>
          </div>
          <div class="d-flex flex-row margin-b20 justify-content-end" v-for="(val, i) in matchData.guestTeamInjuries"
               :key="i">
            <b-col md="1" class="align-self-center pl-0">
              <img src="delete.png" v-on:click="deleteInjury(i, sides.guest)"/>
            </b-col>
            <b-col md="1" class="align-self-center pr-0">
              <img :src="val.type === injuries.light ? img.lightInjury : img.heavyInjury"/>
            </b-col>
            <b-col md="7">
              <b-form-select v-model.number="val.playerId" :class="{'is-invalid': val.playerId === null}" ref="guestTeamInjuries"
                 :options="selectGuestTeamPlayerOptions" v-on:change="checkInjuriesOnDuplicate(i, sides.guest)"></b-form-select>
            </b-col>
          </div>
        </div>
      </b-col>
    </div>
    <b-row class="margin-b20">
      <b-col md="12" class="text-center">
        <b>ИГРОКИ МАТЧА</b>
      </b-col>
    </b-row>
    <div class="d-flex flex-row margin-b20 justify-content-between">
      <b-col md="6" class="pl-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-start">
            <b-col md="7">
              <b-form-select v-model.number="matchData.homeTeamMOTM"
                             :options="selectHomeTeamPlayerOptions"></b-form-select>
            </b-col>
          </div>
        </div>
      </b-col>
      <b-col md="6" class="pr-0">
        <div class="d-flex flex-column">
          <div class="d-flex flex-row margin-b20 justify-content-end">
            <b-col md="7">
              <b-form-select v-model.number="matchData.guestTeamMOTM"
                             :options="selectGuestTeamPlayerOptions"></b-form-select>
            </b-col>
          </div>
        </div>
      </b-col>
    </div>
    <div class="d-flex flex-row margin-b20">
      <b-col md="12" class="text-center">
        <b>КОММЕНТАРИЙ К МАТЧУ</b>
      </b-col>
    </div>
    <div class="d-flex flex-row margin-b40">
      <b-col md="12">
        <textarea v-model="matchData.commentary" style="width: inherit; height: 120px"></textarea>
      </b-col>
    </div>
    <div class="d-flex flex-column margin-b40">
      <b-col md="12" class="text-center margin-b20">
        Чтобы залить скриншоты матча, нажмите на кнопку ниже, откроется хостинг картинок и изображений FastPic.
        Кликаете на кнопку "Выбрать файлы" и выделяете все скрины, которые хотите залить.
        Нажимаете на кнопку "Загрузить". После этого выбираете код из "Для вставки на форум"
        и копируете код в соответствующее окно в генераторе оформления.
      </b-col>
      <b-col md="12" class="text-center margin-b20">
        <input type="button" value="Хостинг изображений"
               onclick="javascript:byn=void(window.open('http://fastpic.ru/','byn','toolbar=1,width=1180,height=680,top=150,left=70'))">
      </b-col>
      <b-col md="12" class="text-center margin-b20">
        <b>СКРИНШОТЫ</b>
      </b-col>
      <b-col md="12">
        <textarea v-model="matchData.screenshots" style="width: inherit; height: 120px"></textarea>
      </b-col>
    </div>
    <div class="d-flex flex-row margin-b20">
      <b-col md="12" class="text-center">
        <input type="button" value="Сгенерировать" v-on:click="generateMatchCode"/>
      </b-col>
    </div>
    <div class="d-flex flex-row margin-b20">
      <b-col md="12">
        <textarea style="width: inherit; height: 120px" v-model="matchData.code" readonly onclick="this.focus(); this.select();"></textarea>
      </b-col>
    </div>
  </b-container>
</template>

<style>
  body {
    background-image: url(../../public/back.png);
    background-repeat: repeat-y;
    background-position: top center;
  }

  .margin-b20 {
    margin-bottom: 20px;
  }

  .margin-b40 {
    margin-bottom: 40px;
  }
</style>

<script>
import axios from 'axios';
import Promise from 'bluebird';

const loadPlayers = async (teamId) => {
  let data = [];
  try {
    data = (await axios.get('/newbase/api/teams.php',
      {
        params: {
          action: 'all-players',
          id: teamId,
        },
      })).data;
  } catch (err) {
    console.error(err);
  }
  return data;
};

const loadTeams = async () => {
  let data = [];
  try {
    data = (await axios.get('/newbase/api/teams.php',
      {
        params: {
          action: 'all-participating-teams',
        },
      })).data;
  } catch (err) {
    console.error(err);
  }
  const formatted = {};
  data.forEach((team) => {
    formatted[team.id] = {
      id: team.id,
      name: team.name,
      players: [],
      league: team.league,
    };
  });
  return formatted;
};

const flushedMatchData = {
  homeTeamId: null,
  guestTeamId: null,
  homeTeamTotalScore: 0,
  guestTeamTotalScore: 0,
  homeTeamExtraTimeScore: null,
  guestTeamExtraTimeScore: null,
  homeTeamPenaltiesScore: null,
  guestTeamPenaltiesScore: null,

  homeTeamGoals: [],
  guestTeamGoals: [],
  homeTeamAssists: [],
  guestTeamAssists: [],
  homeTeamCards: [],
  guestTeamCards: [],
  homeTeamInjuries: [],
  guestTeamInjuries: [],
  homeTeamIntercepts: [],
  guestTeamIntercepts: [],
  homeTeamFouls: [],
  guestTeamFouls: [],
  homeTeamClearedPasses: [],
  guestTeamClearedPasses: [],
  homeTeamMOTM: null,
  guestTeamMOTM: null,
  commentary: '',
  screenshots: '',
  code: '',
  fromFiles: false,
  pes6statVersion: null,
};

export default {
  name: 'Index',
  data() {
    return {
      loadedFiles: null,
      swapTeamsButtonPressed: false,
      img: {
        yellowCard: `${process.env.BASE_URL}yellowcard.gif`,
        redCard: `${process.env.BASE_URL}redcard.gif`,
        delete: `${process.env.BASE_URL}delete.png`,
        plus: `${process.env.BASE_URL}plus.png`,
        lightInjury: `${process.env.BASE_URL}lightinjury.gif`,
        heavyInjury: `${process.env.BASE_URL}heavyinjury.png`,
      },
      teams: {},
      matchData: JSON.parse(JSON.stringify(flushedMatchData)),
      sides: {
        home: 0,
        guest: 1,
      },
      cards: {
        yellow: 0,
        red: 1,
      },
      injuries: {
        light: 0,
        heavy: 1,
      },
      ownGoal: -1,
    };
  },
  async created() {
    this.teams = await loadTeams();
    if (this.$route.query.matchData) {
      const result = await this.restoreMatchData(this.$route.query.matchData);
      if (result) {
        return;
      }
    }
    await this.bootstrap();
  },
  mounted() {
    this.disableEntering();
  },
  updated() {
    this.disableEntering();
  },
  computed: {
    selectTeamOptions() {
      const byLeagues = Object.values(this.teams).reduce((acc, team) => {
        if (!acc[team.league]) {
          acc[team.league] = [];
        }
        acc[team.league].push(team);
        return acc;
      }, {});
      return Object.values(byLeagues).reduce((acc, teams) => {
        const options = teams.map((team) => ({
          value: team.id,
          text: team.name,
        }));
        return acc.concat(options, [{ text: '-------------', value: -1, disabled: true }]);
      }, []);
    },
    selectHomeTeamPlayerOptions() {
      return (this.matchData.homeTeamId && this.teams[this.matchData.homeTeamId].players.map((player) => ({
        value: player.id,
        text: player.name,
      }))) || [];
    },
    selectHomeTeamGoalsOptions() {
      const data = JSON.parse(JSON.stringify(this.selectHomeTeamPlayerOptions));
      data.push({ value: -1, text: 'Автогол' });
      return data;
    },
    selectGuestTeamPlayerOptions() {
      return (this.matchData.guestTeamId && this.teams[this.matchData.guestTeamId].players.map((team) => ({
        value: team.id,
        text: team.name,
      }))) || [];
    },
    selectGuestTeamGoalsOptions() {
      const data = JSON.parse(JSON.stringify(this.selectGuestTeamPlayerOptions));
      data.push({ value: -1, text: 'Автогол' });
      return data;
    },
    homeTeam() {
      return this.teams[this.matchData.homeTeamId];
    },
    guestTeam() {
      return this.teams[this.matchData.guestTeamId];
    },
  },
  methods: {
    swapTeams() {
      const swap = (src1, src2) => {
        const buf = this.matchData[src1];
        this.matchData[src1] = this.matchData[src2];
        this.matchData[src2] = buf;
      };
      this.matchData.code = '';
      swap('homeTeamId', 'guestTeamId');
      swap('homeTeamTotalScore', 'guestTeamTotalScore');
      swap('homeTeamExtraTimeScore', 'guestTeamExtraTimeScore');
      swap('homeTeamPenaltiesScore', 'guestTeamPenaltiesScore');
      swap('homeTeamGoals', 'guestTeamGoals');
      swap('homeTeamAssists', 'guestTeamAssists');
      swap('homeTeamCards', 'guestTeamCards');
      swap('homeTeamInjuries', 'guestTeamInjuries');
      swap('homeTeamMOTM', 'guestTeamMOTM');
      swap('homeTeamIntercepts', 'guestTeamIntercepts');
      swap('homeTeamFouls', 'guestTeamFouls');
      swap('homeTeamClearedPasses', 'guestTeamClearedPasses');
    },

    initMatchData() {
      this.matchData = JSON.parse(JSON.stringify(flushedMatchData));
    },

    findTeamByName(name) {
      return Object.values(this.teams).find((team) => team.name === name);
    },

    findPlayerById(teamId, id) {
      return this.teams[teamId] && this.teams[teamId].players.find((player) => player.id === id);
    },

    async parseMatchData() {
      if (!this.loadedFiles) {
        return;
      }
      const filesData = [];

      const addDataWithCount = (src, dst, teamId) => {
        if (!src) {
          return;
        }
        Object.entries(src).forEach(([key, value]) => {
          const numberKey = Number(key);
          const playerId = numberKey !== this.ownGoal ? this.findPlayerById(teamId, numberKey).id : numberKey;
          const player = dst.find((item) => item.playerId === playerId);
          if (player) {
            player.count += value;
            return;
          }
          dst.push({
            playerId,
            count: value,
          });
        });
      };

      const addDataWithType = (src, dst, teamId, type) => {
        if (!src) {
          return;
        }
        Object.entries(src).forEach(([key]) => {
          const playerId = this.findPlayerById(teamId, Number(key)).id;
          const player = dst.find((item) => item.playerId === playerId);
          if (player) {
            return;
          }
          dst.push({
            playerId,
            type,
          });
        });
      };

      const loadMatchData = async (fd) => {
        const m = this.matchData;
        const homeTeamId = this.findTeamByName(fd.home.team).id;
        const guestTeamId = this.findTeamByName(fd.guest.team).id;

        m.fromFiles = true;
        m.pes6statVersion = fd.version || '< 1.3';
        await Promise.all([this.changeHomeTeam(homeTeamId), this.changeGuestTeam(guestTeamId)]);

        if (fd.home.redCards) {
          Object.keys(fd.home.redCards).forEach((id) => {
            if (fd.home.yellowCards && fd.home.yellowCards[id]) {
              // eslint-disable-next-line no-param-reassign
              delete fd.home.yellowCards[id];
            }
          });
        }

        if (fd.guest.redCards) {
          Object.keys(fd.guest.redCards).forEach((id) => {
            if (fd.guest.yellowCards && fd.guest.yellowCards[id]) {
              // eslint-disable-next-line no-param-reassign
              delete fd.guest.yellowCards[id];
            }
          });
        }

        m.homeTeamTotalScore = fd.home.score;
        m.guestTeamTotalScore = fd.guest.score;

        let playersGoalsCount = Object.values(fd.home.goals).reduce((acc, value) => acc + value, 0);
        if (fd.home.score > playersGoalsCount) {
          // eslint-disable-next-line no-param-reassign
          fd.home.goals[this.ownGoal] = fd.home.score - playersGoalsCount;
        }

        playersGoalsCount = Object.values(fd.guest.goals).reduce((acc, value) => acc + value, 0);
        if (fd.guest.score > playersGoalsCount) {
          // eslint-disable-next-line no-param-reassign
          fd.guest.goals[this.ownGoal] = fd.guest.score - playersGoalsCount;
        }

        if (fd.home.penatiesScore || fd.guest.penatiesScore) {
          m.homeTeamPenaltiesScore = fd.home.penatiesScore;
          m.guestTeamPenaltiesScore = fd.guest.penatiesScore;
        }

        addDataWithCount(fd.home.goals, m.homeTeamGoals, homeTeamId);
        addDataWithCount(fd.guest.goals, m.guestTeamGoals, guestTeamId);
        addDataWithCount(fd.home.assists, m.homeTeamAssists, homeTeamId, guestTeamId);
        addDataWithCount(fd.guest.assists, m.guestTeamAssists, guestTeamId);

        addDataWithType(fd.home.yellowCards, m.homeTeamCards, homeTeamId, this.cards.yellow);
        addDataWithType(fd.home.redCards, m.homeTeamCards, homeTeamId, this.cards.red);
        addDataWithType(fd.guest.yellowCards, m.guestTeamCards, guestTeamId, this.cards.yellow);
        addDataWithType(fd.guest.redCards, m.guestTeamCards, guestTeamId, this.cards.red);

        addDataWithCount(fd.home.intercepts, m.homeTeamIntercepts, homeTeamId);
        addDataWithCount(fd.guest.intercepts, m.guestTeamIntercepts, guestTeamId);

        addDataWithCount(fd.home.fouls, m.homeTeamFouls, homeTeamId);
        addDataWithCount(fd.guest.fouls, m.guestTeamFouls, guestTeamId);

        addDataWithCount(fd.home.clearedPasses, m.homeTeamClearedPasses, homeTeamId);
        addDataWithCount(fd.guest.clearedPasses, m.guestTeamClearedPasses, guestTeamId);
      };
      const merge = async (fd) => {
        const m = this.matchData;
        if (fd.home.redCards) {
          Object.keys(fd.home.redCards).forEach((id) => {
            if (fd.home.yellowCards && fd.home.yellowCards[id]) {
              // eslint-disable-next-line no-param-reassign
              delete fd.home.yellowCards[id];
            }
          });
        }
        if (fd.guest.redCards) {
          Object.keys(fd.guest.redCards).forEach((id) => {
            if (fd.guest.yellowCards && fd.guest.yellowCards[id]) {
              // eslint-disable-next-line no-param-reassign
              delete fd.guest.yellowCards[id];
            }
          });
        }

        if (fd.home.team !== this.homeTeam.name && fd.home.team !== this.guestTeam.name) {
          throw new Error(`team ${fd.home.team} not found`);
        }

        if (fd.guest.team !== this.homeTeam.name && fd.guest.team !== this.guestTeam.name) {
          throw new Error(`team ${fd.guest.team} not found`);
        }

        if (fd.home.team === this.guestTeam.name) {
          const buf = fd.home;
          // eslint-disable-next-line no-param-reassign
          fd.home = fd.guest;
          // eslint-disable-next-line no-param-reassign
          fd.guest = buf;
        }

        m.homeTeamTotalScore += fd.home.score;
        m.guestTeamTotalScore += fd.guest.score;

        let playersGoalsCount = Object.values(fd.home.goals).reduce((acc, value) => acc + value, 0);
        if (fd.home.score > playersGoalsCount) {
          // eslint-disable-next-line no-param-reassign
          fd.home.goals[this.ownGoal] = fd.home.score - playersGoalsCount;
        }

        playersGoalsCount = Object.values(fd.guest.goals).reduce((acc, value) => acc + value, 0);
        if (fd.guest.score > playersGoalsCount) {
          // eslint-disable-next-line no-param-reassign
          fd.guest.goals[this.ownGoal] = fd.guest.score - playersGoalsCount;
        }

        if ((fd.home.penatiesScore || fd.guest.penatiesScore)
          && (m.homeTeamPenaltiesScore || m.guestTeamPenaltiesScore)) {
          throw new Error('Есть счет по пенальти в двух матчах');
        }
        m.homeTeamPenaltiesScore = fd.home.penatiesScore;
        m.guestTeamPenaltiesScore = fd.guest.penatiesScore;

        addDataWithCount(fd.home.goals, m.homeTeamGoals, this.matchData.homeTeamId);
        addDataWithCount(fd.guest.goals, m.guestTeamGoals, this.matchData.guestTeamId);
        addDataWithCount(fd.home.assists, m.homeTeamAssists, this.matchData.homeTeamId);
        addDataWithCount(fd.guest.assists, m.guestTeamAssists, this.matchData.guestTeamId);
        addDataWithCount(fd.home.intercepts, m.homeTeamIntercepts, this.matchData.homeTeamId);
        addDataWithCount(fd.guest.intercepts, m.guestTeamIntercepts, this.matchData.guestTeamId);
        addDataWithCount(fd.home.fouls, m.homeTeamFouls, this.matchData.homeTeamId);
        addDataWithCount(fd.guest.fouls, m.guestTeamFouls, this.matchData.guestTeamId);
        addDataWithCount(fd.home.clearedPasses, m.homeTeamClearedPasses, this.matchData.homeTeamId);
        addDataWithCount(fd.guest.clearedPasses, m.guestTeamClearedPasses, this.matchData.guestTeamId);

        addDataWithType(fd.home.yellowCards, m.homeTeamCards, this.matchData.homeTeamId, this.cards.yellow);
        addDataWithType(fd.home.redCards, m.homeTeamCards, this.matchData.homeTeamId, this.cards.red);
        addDataWithType(fd.guest.yellowCards, m.guestTeamCards, this.matchData.guestTeamId, this.cards.yellow);
        addDataWithType(fd.guest.redCards, m.guestTeamCards, this.matchData.guestTeamId, this.cards.red);
      };

      const filesReaded = new Promise((resolve, reject) => {
        this.loadedFiles
          .sort((a, b) => (a.lastModified > b.lastModified ? 1 : -1))
          .forEach((file, index) => {
            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = () => {
              try {
                const fd = JSON.parse(reader.result);
                filesData.push(fd);
                if (index === this.loadedFiles.length - 1) {
                  resolve();
                }
              } catch (err) {
                reject();
              }
            };

            reader.onerror = () => {
              reject();
            };
          });
      });

      await filesReaded
        .then(() => { this.initMatchData(); })
        .then(() => Promise.each(filesData, (fileData, index) => {
          if (index === 0) {
            return loadMatchData(fileData);
          }
          return merge(fileData);
        })).catch((err) => {
          console.error(err);
          alert('Неверный формат файла');
          this.initMatchData();
          this.loadedFiles = [];
        });
    },

    async restoreMatchData(rawData) {
      let matchData;
      try {
        matchData = JSON.parse(rawData);
      } catch (err) {
        alert('Неверный формат данных в запросе');
        return false;
      }
      await Promise.all([this.changeHomeTeam(matchData.homeTeamId), this.changeGuestTeam(matchData.guestTeamId)]);
      this.matchData = matchData;
      return true;
    },

    onChangeHomeTeamTotalScore() {
      this.checkGoalsByChangedScore(this.matchData.homeTeamGoals, this.sides.home);
      this.checkAssistsByChangedScore(this.matchData.homeTeamGoals, this.sides.home);
    },

    onChangeGuestTeamTotalScore() {
      this.checkGoalsByChangedScore(this.matchData.guestTeamGoals, this.sides.guest);
      this.checkAssistsByChangedScore(this.matchData.guestTeamGoals, this.sides.guest);
    },

    disableEntering() {
      document.querySelectorAll('input[type=number]').forEach((input) => {
        input.addEventListener('keypress', (event) => {
          event.preventDefault();
        });
      });
    },

    async checkOnChangeExtraScore(side) {
      if (side === this.sides.home) {
        this.matchData.guestTeamExtraTimeScore = this.matchData.guestTeamExtraTimeScore || 0;
      } else {
        this.matchData.homeTeamExtraTimeScore = this.matchData.homeTeamExtraTimeScore || 0;
      }
    },

    async checkOnChangePenaltiesScore(side) {
      if (side === this.sides.home) {
        this.matchData.guestTeamPenaltiesScore = this.matchData.guestTeamPenaltiesScore || 0;
      } else {
        this.matchData.homeTeamPenaltiesScore = this.matchData.homeTeamPenaltiesScore || 0;
      }
    },

    async changeHomeTeam(id) {
      this.matchData.homeTeamId = id;
      if (this.teams[this.matchData.homeTeamId].players.length) {
        return;
      }

      this.teams[this.matchData.homeTeamId].players = await loadPlayers(id);
      const toNull = ['homeTeamGoals', 'homeTeamAssists', 'homeTeamCards', 'homeTeamInjuries', 'homeTeamMOTM'];
      toNull.forEach((key) => {
        if (!Array.isArray(this.matchData[key])) {
          this.matchData[key] = null;
          return;
        }
        this.matchData[key].forEach((data) => {
          // eslint-disable-next-line no-param-reassign
          data.playerId = null;
        });
      });
    },

    async changeGuestTeam(id) {
      this.matchData.guestTeamId = id;
      if (this.teams[this.matchData.guestTeamId].players.length) {
        return;
      }
      this.teams[this.matchData.guestTeamId].players = await loadPlayers(id);
      const toNull = ['guestTeamGoals', 'guestTeamAssists', 'guestTeamCards', 'guestTeamInjuries', 'guestTeamMOTM'];
      toNull.forEach((key) => {
        if (!Array.isArray(this.matchData[key])) {
          this.matchData[key] = null;
          return;
        }
        this.matchData[key].forEach((data) => {
          // eslint-disable-next-line no-param-reassign
          data.playerId = null;
        });
      });
    },

    async bootstrap() {
      if (!Object.keys(this.teams).length) {
        throw new Error('unable to load teams');
      }
      const [{ id: homeTeamId }] = Object.values(this.teams);
      const [{ id: guestTeamId }] = Object.values(this.teams);
      await Promise.all([this.changeHomeTeam(homeTeamId), this.changeGuestTeam(guestTeamId)]);
    },

    checkGoalsByChangedCount(changedIndex, side) {
      const goals = side === this.sides.home ? this.matchData.homeTeamGoals : this.matchData.guestTeamGoals;
      const score = side === this.sides.home ? this.matchData.homeTeamTotalScore : this.matchData.guestTeamTotalScore;

      const goalsCount = goals.reduce((acc, item) => acc + item.count, 0);
      const action = goalsCount > score ? 1 : 0;
      this.fixGoals(goals, goalsCount - score, action, changedIndex);
    },

    fixGoals(goals, diff, action, freezeIndex = -1) {
      // eslint-disable-next-line no-param-reassign
      diff = Math.abs(diff);
      if (action === 1) {
        let i = goals.length - 1;
        while (diff > 0 && i >= 0) {
          if (i === freezeIndex) {
            i--;
            continue;
          }
          if (diff >= goals[i].count) {
            // eslint-disable-next-line no-param-reassign
            diff -= goals[i].count;
            goals.splice(i, 1);
          } else {
            // eslint-disable-next-line no-param-reassign
            goals[i].count -= diff;
            // eslint-disable-next-line no-param-reassign
            diff = 0;
          }
          i--;
        }
      } else {
        while (diff > 0) {
          goals.push({ count: 1, playerId: null });
          // eslint-disable-next-line no-param-reassign
          diff--;
        }
      }
    },

    checkGoalsByChangedScore(goals, side) {
      let newScore;
      let oldScore;
      if (side === this.sides.home) {
        newScore = this.matchData.homeTeamTotalScore;
        oldScore = this.matchData.homeTeamGoals.reduce((acc, data) => acc + data.count, 0);
      } else {
        newScore = this.matchData.guestTeamTotalScore;
        oldScore = this.matchData.guestTeamGoals.reduce((acc, data) => acc + data.count, 0);
      }
      const action = newScore - oldScore > 0 ? 0 : 1;
      this.fixGoals(goals, newScore - oldScore, action);
    },

    checkDataOnMerge(changedIndex, key) {
      const g = this.matchData[key];
      const { playerId } = g[changedIndex];
      const matchedIndexes = [];
      g.forEach((data, i) => {
        if (data.playerId === playerId) {
          matchedIndexes.push(i);
        }
      });
      if (matchedIndexes.length === 1) {
        return;
      }
      let indexToMerge = -1;
      matchedIndexes.forEach((index) => {
        if (indexToMerge === -1 && index !== changedIndex) {
          indexToMerge = index;
        }
        if (indexToMerge === -1 || indexToMerge === index) {
          return;
        }
        g[indexToMerge].count += g[index].count;
        g.splice(index, 1);
      });
    },

    checkAssistsByChangedScore(assists, side) {
      let newScore;
      let oldScore;
      if (side === this.sides.home) {
        newScore = this.matchData.homeTeamTotalScore;
        oldScore = this.matchData.homeTeamGoals.reduce((acc, data) => acc + data.count, 0);
      } else {
        newScore = this.matchData.guestTeamTotalScore;
        oldScore = this.matchData.guestTeamGoals.reduce((acc, data) => acc + data.count, 0);
      }
      if (newScore === 0) {
        assists.splice(0);
        return;
      }
      if (newScore < oldScore) {
        const assistsCount = assists.reduce((acc, data) => acc + data.count, 0);
        if (assistsCount <= newScore) {
          return;
        }
        let diff = oldScore - newScore;
        let i = assists.length - 1;
        while (diff > 0 && i >= 0) {
          if (diff >= assists[i].count) {
            diff -= assists[i].count;
            assists.splice(i, 1);
          } else {
            // eslint-disable-next-line no-param-reassign
            assists[i].count -= diff;
            diff = 0;
          }
          i--;
        }
      }
    },

    addAssist(side) {
      const assists = side === this.sides.home ? this.matchData.homeTeamAssists : this.matchData.guestTeamAssists;
      const score = side === this.sides.home ? this.matchData.homeTeamTotalScore : this.matchData.guestTeamTotalScore;
      const assistsCount = assists.reduce((acc, data) => acc + data.count, 0);
      if (assistsCount < score) {
        assists.push({ playerId: null, count: 1 });
      }
    },
    deleteAssist(i, side) {
      const assists = side === this.sides.home ? this.matchData.homeTeamAssists : this.matchData.guestTeamAssists;
      assists.splice(i, 1);
    },

    addCard(type, side) {
      const cards = side === this.sides.home ? this.matchData.homeTeamCards : this.matchData.guestTeamCards;
      cards.push({ type, playerId: null });
    },

    deleteCard(i, side) {
      const cards = side === this.sides.home ? this.matchData.homeTeamCards : this.matchData.guestTeamCards;
      cards.splice(i, 1);
    },

    checkCardsOnDuplicate(changedIndex, side) {
      const cards = side === this.sides.home ? this.matchData.homeTeamCards : this.matchData.guestTeamCards;
      const { playerId } = cards[changedIndex];
      const matchedIndexes = [];
      cards.forEach((data, i) => {
        if (data.playerId === playerId) {
          matchedIndexes.push(i);
        }
      });
      if (matchedIndexes.length === 1) {
        return;
      }
      matchedIndexes.forEach((index) => {
        if (index !== changedIndex) {
          cards.splice(index, 1);
        }
      });
    },

    addInjury(type, side) {
      const injuries = side === this.sides.home ? this.matchData.homeTeamInjuries : this.matchData.guestTeamInjuries;
      injuries.push({ type, playerId: null });
    },

    deleteInjury(i, side) {
      const injuries = side === this.sides.home ? this.matchData.homeTeamInjuries : this.matchData.guestTeamInjuries;
      injuries.splice(i, 1);
    },

    checkInjuriesOnDuplicate(changedIndex, side) {
      const injuries = side === this.sides.home ? this.matchData.homeTeamInjuries : this.matchData.guestTeamInjuries;
      const { playerId } = injuries[changedIndex];
      const matchedIndexes = [];
      injuries.forEach((data, i) => {
        if (data.playerId === playerId) {
          matchedIndexes.push(i);
        }
      });
      if (matchedIndexes.length === 1) {
        return;
      }
      matchedIndexes.forEach((index) => {
        if (index !== changedIndex) {
          injuries.splice(index, 1);
        }
      });
    },

    checkOnCorrectMatchFilling() {
      const toCheck = [
        'homeTeamGoals', 'homeTeamAssists', 'homeTeamCards', 'homeTeamInjuries',
        'guestTeamGoals', 'guestTeamAssists', 'guestTeamCards', 'guestTeamInjuries',
      ];
      const notFilled = [];
      toCheck.forEach((key) => {
        this.matchData[key].forEach((data, i) => {
          if (data.playerId === null) {
            notFilled.push({ index: i, key });
          }
        });
      });

      if (notFilled.length) {
        this.$refs[notFilled[0].key][notFilled[0].index].$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return !notFilled.length;
    },

    generateMatchCode() {
      if (!this.checkOnCorrectMatchFilling()) {
        this.matchData.code = '';
        return;
      }
      let code = '';
      const m = this.matchData;
      const htn = this.teams[this.matchData.homeTeamId].name;
      const gtn = this.teams[this.matchData.guestTeamId].name;
      let matchScore = `${m.homeTeamTotalScore}-${m.guestTeamTotalScore}`;
      if (m.homeTeamExtraTimeScore || m.guestTeamExtraTimeScore) {
        matchScore += ` (Доп.: ${m.homeTeamExtraTimeScore}-${m.guestTeamExtraTimeScore})`;
      } else if (m.homeTeamPenaltiesScore || m.guestTeamPenaltiesScore) {
        matchScore += ` (Доп.: ${m.homeTeamExtraTimeScore}-${m.guestTeamExtraTimeScore}, `
        + ` Пен.: ${m.homeTeamPenaltiesScore}-${m.guestTeamPenaltiesScore})`;
      }
      code += '[font=lucida sans unicode,lucida grande,sans-serif][size=5][b][img]'
              + `http://pesway.ru/img/emblems/${htn}.png[/img] ${htn}[color=#ff0000] `
              + `${matchScore} [/color]${gtn}[img]http://pesway.ru/img/emblems/${gtn}.png[/img][/size][/b]\n\n`;

      if (m.homeTeamGoals.length || m.guestTeamGoals.length) {
        code += '[b]Голы:[/b]';
        if (m.homeTeamGoals.length) {
          code += `\n[color=#ff2400]${htn} [/color] -`;
          m.homeTeamGoals.forEach((data, index) => {
            if (index !== 0) {
              code += ',';
            }
            let name;
            if (data.playerId === this.ownGoal) {
              name = 'Автогол';
            } else {
              name = this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name;
            }
            code += ` ${name}`;
            if (data.count > 1) {
              code += ` (${data.count})`;
            }
          });
        }
        if (m.guestTeamGoals.length) {
          code += `\n[color=#7fc7ff]${gtn} [/color] -`;
          m.guestTeamGoals.forEach((data, index) => {
            if (index !== 0) {
              code += ',';
            }
            let name;
            if (data.playerId === this.ownGoal) {
              name = 'Автогол';
            } else {
              name = this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name;
            }
            code += ` ${name}`;
            if (data.count > 1) {
              code += ` (${data.count})`;
            }
          });
        }
        code += '\n\n';
      }

      if (m.homeTeamAssists.length || m.guestTeamAssists.length) {
        code += '[b]Ассисты:[/b]';
        if (m.homeTeamAssists.length) {
          code += `\n[color=#ff2400]${htn} [/color] -`;
          m.homeTeamAssists.forEach((data, index) => {
            if (index !== 0) {
              code += ',';
            }
            const { name } = this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId);
            code += ` ${name}`;
            if (data.count > 1) {
              code += ` (${data.count})`;
            }
          });
        }
        if (m.guestTeamAssists.length) {
          code += `\n[color=#7fc7ff]${gtn} [/color] -`;
          m.guestTeamAssists.forEach((data, index) => {
            if (index !== 0) {
              code += ',';
            }
            const { name } = this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId);
            code += ` ${name}`;
            if (data.count > 1) {
              code += ` (${data.count})`;
            }
          });
        }
        code += '\n\n';
      }

      if (m.homeTeamCards.length || m.guestTeamCards.length) {
        code += '[b]Карточки:[/b]';
        if (m.homeTeamCards.length) {
          Object.values(this.cards).forEach((type) => {
            const cards = m.homeTeamCards.filter((card) => card.type === type);
            if (!cards.length) {
              return;
            }
            const img = type === this.cards.yellow ? this.img.yellowCard : this.img.redCard;
            code += `\n[color=#ff2400]${htn} [/color][img]${img}[/img] -`;
            cards.forEach((data, index) => {
              if (index !== 0) {
                code += ',';
              }
              const { name } = this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId);
              code += ` ${name}`;
            });
          });
        }
        if (m.guestTeamCards.length) {
          Object.values(this.cards).forEach((type) => {
            const cards = m.guestTeamCards.filter((card) => card.type === type);
            if (!cards.length) {
              return;
            }
            const img = type === this.cards.yellow ? this.img.yellowCard : this.img.redCard;
            code += `\n[color=#7fc7ff]${gtn} [/color][img]${img}[/img] -`;
            cards.forEach((data, index) => {
              if (index !== 0) {
                code += ',';
              }
              const { name } = this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId);
              code += ` ${name}`;
            });
          });
        }
        code += '\n\n';
      }

      if (m.homeTeamInjuries.length || m.guestTeamInjuries.length) {
        code += '[b]Травмы:[/b]';
        if (m.homeTeamInjuries.length) {
          Object.values(this.injuries).forEach((type) => {
            const injuries = m.homeTeamInjuries.filter((injury) => injury.type === type);
            if (!injuries.length) {
              return;
            }
            const img = type === this.injuries.light ? this.img.lightInjury : this.img.heavyInjury;
            code += `\n[color=#ff2400]${htn} [/color][img]${img}[/img] -`;
            injuries.forEach((data, index) => {
              if (index !== 0) {
                code += ',';
              }
              const { name } = this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId);
              code += ` ${name}`;
            });
          });
        }
        if (m.guestTeamInjuries.length) {
          Object.values(this.injuries).forEach((type) => {
            const injuries = m.guestTeamInjuries.filter((injury) => injury.type === type);
            if (!injuries.length) {
              return;
            }
            const img = type === this.injuries.light ? this.img.lightInjury : this.img.heavyInjury;
            code += `\n[color=#7fc7ff]${gtn} [/color][img]${img}[/img] -`;
            injuries.forEach((data, index) => {
              if (index !== 0) {
                code += ',';
              }
              const { name } = this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId);
              code += ` ${name}`;
            });
          });
        }
        code += '\n\n';
      }

      if (m.homeTeamMOTM !== null || m.guestTeamMOTM !== null) {
        code += '[list][*][b]Игрок матча:[/b] ';
        if (m.homeTeamMOTM !== null) {
          const { name } = this.teams[this.matchData.homeTeamId].players.find((player) => player.id === m.homeTeamMOTM);
          code += `${name} [img]http://pesway.ru/img/mvp.png[/img]`;
          if (m.guestTeamMOTM !== null) {
            code += ' - ';
          }
        }
        if (m.guestTeamMOTM) {
          const { name } = this.teams[this.matchData.guestTeamId].players.find((player) => player.id === m.guestTeamMOTM);
          code += `[img]http://pesway.ru/img/mvp.png[/img] ${name}`;
        }
        code += '[/list]\n';
      }

      if (m.homeTeamIntercepts.length || m.guestTeamIntercepts.length) {
        const sortedHomeTeamIntercepts = m.homeTeamIntercepts.sort((a, b) => (a.count > b.count ? -1 : 1));
        const sortedGuestTeamIntercepts = m.guestTeamIntercepts.sort((a, b) => (a.count > b.count ? -1 : 1));
        code += '[list][*][b]Лидеры перехватов и отборов:[/b] ';

        if (sortedHomeTeamIntercepts[0]) {
          const { name } = this.teams[this.matchData.homeTeamId].players
            .find((player) => player.id === sortedHomeTeamIntercepts[0].playerId);
          code += `${name} (${sortedHomeTeamIntercepts[0].count}) [img]http://pesway.ru/img/mvp.png[/img]`;
          if (sortedGuestTeamIntercepts[0]) {
            code += ' - ';
          }
        }
        if (sortedGuestTeamIntercepts[0]) {
          const { name } = this.teams[this.matchData.guestTeamId].players
            .find((player) => player.id === sortedGuestTeamIntercepts[0].playerId);
          code += `[img]http://pesway.ru/img/mvp.png[/img] ${name} (${sortedGuestTeamIntercepts[0].count})`;
        }

        code += '[/list]\n';
      }

      if (m.homeTeamClearedPasses.length || m.guestTeamClearedPasses.length) {
        const sortedHomeTeamClearedPasses = m.homeTeamClearedPasses.sort((a, b) => (a.count > b.count ? -1 : 1));
        const sortedGuestTeamClearedPasses = m.guestTeamClearedPasses.sort((a, b) => (a.count > b.count ? -1 : 1));
        code += '[list][*][b]Лидеры точных передач:[/b] ';

        if (sortedHomeTeamClearedPasses[0]) {
          const { name } = this.teams[this.matchData.homeTeamId].players
            .find((player) => player.id === sortedHomeTeamClearedPasses[0].playerId);
          code += `${name} (${sortedHomeTeamClearedPasses[0].count}) [img]http://pesway.ru/img/mvp.png[/img]`;
          if (sortedHomeTeamClearedPasses[0]) {
            code += ' - ';
          }
        }
        if (sortedGuestTeamClearedPasses[0]) {
          const { name } = this.teams[this.matchData.guestTeamId].players
            .find((player) => player.id === sortedGuestTeamClearedPasses[0].playerId);
          code += `[img]http://pesway.ru/img/mvp.png[/img] ${name} (${sortedGuestTeamClearedPasses[0].count})`;
        }

        code += '[/list]\n';
      }

      if (m.homeTeamFouls.length || m.guestTeamFouls.length) {
        const sortedHomeTeamFouls = m.homeTeamFouls.sort((a, b) => (a.count > b.count ? -1 : 1));
        const sortedGuestTeamFouls = m.guestTeamFouls.sort((a, b) => (a.count > b.count ? -1 : 1));
        code += '[list][*][b]Лидеры по фолам:[/b] ';

        if (sortedHomeTeamFouls[0]) {
          const { name } = this.teams[this.matchData.homeTeamId].players
            .find((player) => player.id === sortedHomeTeamFouls[0].playerId);
          code += `${name} (${sortedHomeTeamFouls[0].count})`;
          if (sortedGuestTeamFouls[0]) {
            code += ' - ';
          }
        }
        if (sortedGuestTeamFouls[0]) {
          const { name } = this.teams[this.matchData.guestTeamId].players
            .find((player) => player.id === sortedGuestTeamFouls[0].playerId);
          code += `${name} (${sortedGuestTeamFouls[0].count})`;
        }

        code += '[/list]\n';
      }

      code += '\n';

      if (m.commentary) {
        code += `[b]Комментарий:[/b]\n${m.commentary}\n\n`;
      }

      if (m.screenshots) {
        code += `[spoiler]\n${m.screenshots}\n[/spoiler]\n\n`;
      }

      const restoreUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?`
        + `matchData=${encodeURIComponent(JSON.stringify(this.matchData))}`;

      code += `[url=${restoreUrl}]\n`
        + '[b]Ссылка на проверку в генераторе[/b]\n'
        + '[/url]\n\n';

      console.log(restoreUrl);

      const LMOData = {
        count: {
          home: m.homeTeamTotalScore + (m.homeTeamPenaltiesScore > m.guestTeamPenaltiesScore ? 1 : 0),
          guest: m.guestTeamTotalScore + (m.guestTeamPenaltiesScore > m.homeTeamPenaltiesScore ? 1 : 0),
        },
        teams: {
          home: this.teams[this.matchData.homeTeamId].name,
          guest: this.teams[this.matchData.guestTeamId].name,
        },
        goals: {
          home: {
            ...m.homeTeamGoals.map((data) => ({
              count: data.count,
              id: data.playerId !== this.ownGoal ? data.playerId : undefined,
              name: data.playerId !== this.ownGoal
                ? this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name : 'Own goal',
            })),
          },
          guest: {
            ...m.guestTeamGoals.map((data) => ({
              count: data.count,
              id: data.playerId !== -1 ? data.playerId : undefined,
              name: data.playerId !== this.ownGoal
                ? this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name : 'Own goal',
            })),
          },
        },
        win_by_penalties: m.homeTeamPenaltiesScore !== m.guestTeamPenaltiesScore,
        fromFiles: this.matchData.fromFiles,
        pes6statVersion: this.matchData.pes6statVersion,
        assists: {
          home: {
            ...m.homeTeamAssists.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamAssists.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        cards: {
          home: {
            ...m.homeTeamCards.map((data) => ({
              type: data.type === this.cards.yellow ? 1 : 2,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamCards.map((data) => ({
              type: data.type === this.cards.yellow ? 1 : 2,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        injuries: {
          home: {
            ...m.homeTeamInjuries.map((data) => ({
              type: data.type === this.injuries.light ? 1 : 2,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamInjuries.map((data) => ({
              type: data.type === this.injuries.light ? 1 : 2,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        intercepts: {
          home: {
            ...m.homeTeamIntercepts.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamIntercepts.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        fouls: {
          home: {
            ...m.homeTeamFouls.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamFouls.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        clearedPasses: {
          home: {
            ...m.homeTeamClearedPasses.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.homeTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
          guest: {
            ...m.guestTeamClearedPasses.map((data) => ({
              count: data.count,
              id: data.playerId,
              name: this.teams[this.matchData.guestTeamId].players.find((player) => player.id === data.playerId).name,
            })),
          },
        },
        motm: {
          home: m.homeTeamMOTM !== null ? m.homeTeamMOTM : 0,
          guest: m.guestTeamMOTM !== null ? m.guestTeamMOTM : 0,
        },
      };
      if (this.matchData.fromFiles) {
        code += '[b]Оформлен через файлы:[/b] Да\n\n';
      }
      code += '[b]Код матча:[/b]\n[code]\n'
      + `${JSON.stringify(LMOData)}\n[/code]\n[/font]`;

      this.matchData.code = code;
    },
  },
};
</script>
