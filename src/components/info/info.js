import {Typography} from 'antd';
import withStore from "../../hocs/withStores";

const {Title, Paragraph} = Typography;

const Info = (props) => {
    const name = Object.keys(props.stores.modelStore.selectedPart).length === 0 ?
        "Объект не выбран" :
        props.stores.modelStore.selectedPart.parent.name
    return (
        <Typography>
            <Title>{
                name
            }</Title>
            <Paragraph>
                In the process of internal desktop applications development, many different design specs and
                implementations would be involved, which might cause designers and developers difficulties and
                duplication and reduce the efficiency of development.
            </Paragraph>
        </Typography>
    )
}

export default withStore(Info);