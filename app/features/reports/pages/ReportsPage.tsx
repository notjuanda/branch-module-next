"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
} from "@mui/material";
import {
    HiOutlineChartBar,
    HiOutlineCube,
    HiOutlineCollection,
    HiOutlineSwitchHorizontal,
} from "react-icons/hi";
import {
    InventoryCountReport,
    StockByBranchReport,
    MovementsReport,
} from "../components";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`report-tabpanel-${index}`}
            aria-labelledby={`report-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <HiOutlineChartBar size={28} color="var(--color-primary)" />
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        sx={{
                            color: "var(--color-text)",
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                        }}
                    >
                        Reportes de Inventario
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text-muted)" }}
                >
                    Visualiza el estado del inventario, stock por sucursal y movimientos
                </Typography>
            </Box>

            {/* Tabs */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "8px 8px 0 0",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            color: "var(--color-text-muted)",
                            minHeight: 56,
                            "&.Mui-selected": {
                                color: "var(--color-primary)",
                            },
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "var(--color-primary)",
                        },
                    }}
                >
                    <Tab
                        icon={<HiOutlineCollection size={20} />}
                        iconPosition="start"
                        label="Conteo de Inventario"
                    />
                    <Tab
                        icon={<HiOutlineCube size={20} />}
                        iconPosition="start"
                        label="Stock por Sucursal"
                    />
                    <Tab
                        icon={<HiOutlineSwitchHorizontal size={20} />}
                        iconPosition="start"
                        label="Movimientos"
                    />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box
                sx={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    p: 3,
                }}
            >
                <TabPanel value={activeTab} index={0}>
                    <InventoryCountReport />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    <StockByBranchReport />
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                    <MovementsReport />
                </TabPanel>
            </Box>
        </Box>
    );
}
