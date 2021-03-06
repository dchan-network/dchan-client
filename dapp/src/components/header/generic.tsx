import HeaderNavigation from "components/header/HeaderNavigation"
import HeaderLogo from "components/header/logo"
import { DateTime } from "luxon"

const GenericHeader = ({title, baseUrl, block, dateTime}: {title: string, baseUrl?: string, block?: string, dateTime?: DateTime}) => (
    <header>
        <HeaderNavigation baseUrl={baseUrl} block={block} dateTime={dateTime} />
        <HeaderLogo />

        <div className="text-4xl text-contrast font-weight-800 font-family-tahoma">
            {title}
        </div>
        <div className="p-2">
            <hr></hr>
        </div>
    </header>
)

export default GenericHeader