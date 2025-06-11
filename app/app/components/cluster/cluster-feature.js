"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClusterFeature;
const react_1 = require("react");
const cluster_ui_1 = require("./cluster-ui");
const cluster_ui_2 = require("./cluster-ui");
const ui_helper_1 = require("../ui-helper");
function ClusterFeature() {
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    return (<div>
      <ui_helper_1.AppHero title='Clusters' subtitle='Manage and select your Solana clusters'>
        <cluster_ui_1.ClusterUiModal show={showModal} hideModal={() => setShowModal(false)}/>
        <button className='btn btn-xs lg:btn-md btn-primary' onClick={() => setShowModal(true)}>
          Add Cluster
        </button>
      </ui_helper_1.AppHero>
      <cluster_ui_2.ClusterUiTable />
    </div>);
}
