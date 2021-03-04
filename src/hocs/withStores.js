import { observer, inject } from "mobx-react";

const withStores = (Component) => {
    return inject('stores')(observer(Component));
}
export default withStores;