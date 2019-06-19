<template>
  <div class="column side-nav-container" :class="visible? classes:'hidden'">
    <div class="side-nav is-primary column" :class="visible? classes:'hidden'">
      <div class="items-container">
        <div class="company-logo">
          <div v-if="logo">
            <img :src="logo">
          </div>
          <div v-if="!company" class="company-cover has-text-centered">
            <span class="has-text-weight-bold has-text-white-bis is-size-4" v-text="'ADM2'"/>
          </div>
          <div v-else class="company-cover has-text-centered">
            <span class="has-text-weight-bold has-text-white-bis is-size-4" v-text="company.name"/>
          </div>
        </div>
        <div class="nav-items">
          <div
            v-for="(item, i) in items"
            @click="to(item.path)"
            :key="`item-${i}`"
            class="nav-item"
            v-text="item.label"/>
        </div>
      </div>
      <div class="bottom-items">
        <button @click="to('settings')" class="btn settings">
          <b-icon icon="settings" size="is-normal"></b-icon>
        </button>
        <button class="btn logout">
          <b-icon icon="exit-to-app" size="is-normal"></b-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/event-bus";

export default {
  name: "side-nav",

  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      logo: localStorage.getItem("company_logo"),
      items: [
        { label: "POS", path: "pos" },
        { label: "Productos", path: "products" },
        { label: "Inventarios", path: "inventories" },
        { label: "Ventas", path: "sales" },
        { label: "Empleados", path: "home" }
      ]
    };
  },

  computed: {
    ...mapState(["company"]),
    classes() {
      return "is-2-desktop " + "is-2-mobile" + " is-2-tablet";
    }
  },

  methods: {
    to(path) {
      this.$router.push({name: path});
    },

    updateLogo() {
      this.logo = localStorage.getItem("company_logo");
    }
  },

  mounted() {
    // Listen event bus
    EventBus.$on("UPDATE_LOGO", () => {
      this.updateLogo();
    });
  }
};
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}

.side-nav-container {
  position: relative;
}
.side-nav {
  padding: 0px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d6d6d6;
  .company-logo {
    padding-bottom: 8px;
    img {
      width: auto;
      height: 120px;
    }
  }
  .company-cover {
    height: 120px;
    background: linear-gradient(135deg, #469c5a 0%, #86b4cc 100%);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .items-container {
    flex-grow: 1;
    background-color: white;
  }
  .bottom-items {
    display: flex;
    .btn {
      border: none;
      width: 100%;
      height: 48px;
      color: white;
      cursor: pointer;
      transition: 0.3s;
    }
    .settings {
      background-color: #00acc1;
      &:hover {
        background-color: #1e88e5;
      }
    }
    .logout {
      background-color: #f4511e;
      &:hover {
        background-color: #e64a19;
      }
    }
  }
}
.nav-items {
  .nav-item {
    padding: 11px 10px;
    cursor: pointer;
    transition: 0.3s;
    border-bottom: 1px solid #f5f5f5;
    &:hover {
      color: white;
      background-color: #78909c;
      padding: 11px 15px;
    }
  }
}
</style>