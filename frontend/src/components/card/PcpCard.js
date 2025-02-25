import CustomCard from "./Card";
import ParallelCoordinates from "../PCP";

const PcpCard = () => {
    return (
        <CustomCard>
            <ParallelCoordinates /> {/* Chart is now inside the card */}
        </CustomCard>
    );
};

export default PcpCard;