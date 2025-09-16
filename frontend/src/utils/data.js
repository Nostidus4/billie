import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuLogOut,
} from "react-icons/lu";

import { SiFuturelearn } from "react-icons/si";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        icon: LuLayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
    },
    {
        id: "02",
        icon: LuHandCoins ,
        label: "Income",
        path: "/income",
    },
    {
        id: "03",
        icon: LuWalletMinimal ,
        label: "Expense",
        path: "/expense",
    },
    {
        id: "04",
        icon: SiFuturelearn ,
        label: "Prediction",
        path: "/prediction",
    },
    {
        id: "05",
        icon: LuLogOut ,
        label: "Logout",
        path: "/logout",
    }
]