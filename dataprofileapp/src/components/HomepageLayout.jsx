import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import {
    CssBaseline,
    Paper,
    Typography,
    Button,
    IconButton,
    TextField,
    Grid,
    Box, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    FormControlLabel,
    createTheme,
    ThemeProvider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DatabaseIcon from '@mui/icons-material/Storage'; // Placeholder icon
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Connected Status
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Not Connected Status
import ArrowRightIcon from '@mui/icons-material/ArrowRight'; // Details arrow
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Expand icon
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Collapse icon
import OtherHousesIcon from '@mui/icons-material/OtherHouses'; // Placeholder for "Other Database"
import WifiIcon from '@mui/icons-material/Wifi'; // Standard Wifi Icon
import WifiOffIcon from '@mui/icons-material/WifiOff'; // Wifi Off Icon


const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    main: '#1976d2',
                },
                secondary: {
                    main: '#dc004e',
                },
                background: {
                    default: '#f0f2f5',
                    paper: '#fff',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                },
                 // Adjust status colors for light mode if needed
                status: {
                     connected: '#4caf50', // Green
                     notConnected: '#f44336', // Red
                     saliented: '#ff9800', // Orange
                },
            }
            : { // Dark Mode
                primary: {
                    main: '#90caf9',
                },
                secondary: {
                    main: '#f48fb1',
                },
                background: {
                    default: '#121212',
                    paper: '#1e1e1e',
                },
                text: {
                    primary: '#fff',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                },
                 // Adjust status colors for dark mode if needed
                 status: {
                     connected: '#81c784', // Light Green
                     notConnected: '#e57373', // Light Red
                     saliented: '#ffb74d', // Light Orange
                 },
            }),
    },
});

// Helper hook for theme creation
const useMemoizedTheme = (mode) => useMemo(() => createTheme(getDesignTokens(mode)), [mode]);


const HomepageLayout = () => {
    const [mode, setMode] = useState(() => {
        const storedMode = localStorage.getItem('themeMode');
        // Default to 'dark' if no mode is stored or if stored mode is not 'light'
        return storedMode === 'light' ? 'light' : 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const theme = useMemoizedTheme(mode);

    const handleThemeToggle = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Placeholder Handlers for Buttons (to prevent errors)
    const handleButtonClick = (buttonName) => {
        console.log(`${buttonName} clicked`);
        // Implement actual logic later (API call, dialog, navigation)
    };

     const handleCloseCard = (cardName) => {
         console.log(`Close button clicked for ${cardName}`);
         // Implement logic to hide the card later if needed
     };

     const handleListItemClick = (itemDetails) => {
         console.log('List item clicked:', itemDetails);
         // Implement logic for navigating or showing details
     };

     const handleTableItemClick = (itemDetails) => {
         console.log('Table item clicked:', itemDetails);
         // Implement logic for expanding or showing details
     };


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ p: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}> {/* Apply default background color */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    {/* Using a simple label for the switch */}
                     <Typography variant="body2" color="text.primary" sx={{ mr: 1 }}>
                         {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                     </Typography>
                    <Switch
                        checked={mode === 'dark'} // Checked when in dark mode
                        onChange={handleThemeToggle}
                        color="primary" // Use primary color for the switch
                        inputProps={{ 'aria-label': 'theme toggle switch' }}
                    />
                </Box>

                {/* Main container for the cards using Flexbox for positioning */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap', // Allow items to wrap to the next line
                        gap: 3, // Space between cards
                        justifyContent: 'center', // Center the cards horizontally
                        // Adjust max-width if needed to control wrapping behavior
                        maxWidth: 'lg', // Example: constrain the container width
                        mx: 'auto', // Center the container if using maxWidth
                    }}
                >
                    {/* Data Sources Card */}
                    {/* Using Grid item for consistent padding/margin within the flex container */}
                    <Grid item xs={12} sm={6} md={5} lg={4.5} // Adjust breakpoint widths to approximate proportions
                          sx={{ flexGrow: 1, flexBasis: 'min(400px, 100%)' }} // Use flexBasis for preferred width
                    >
                        <Paper sx={{ p: 2, height: '100%' }}> {/* Ensure paper fills the item height */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Data Sources</Typography>
                                <Button variant="contained" startIcon={<AddIcon />} size="small"
                                        onClick={() => handleButtonClick('Add Connection (Data Sources)')}
                                >
                                    Add Connection
                                </Button>
                            </Box>
                             {/* Use Box for list items to have more control over layout */}
                            <Box>
                                {/* Header row simulation */}
                                <Box sx={{ display: 'flex', borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5, mb: 0.5, color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                                    <Box sx={{ width: '30%' }}>Name</Box>
                                    <Box sx={{ width: '20%' }}>Type</Box>
                                    <Box sx={{ width: '20%' }}>Status</Box>
                                    <Box sx={{ width: '20%' }}>Connection Details</Box>
                                    <Box sx={{ width: '10%', textAlign: 'right' }}></Box> {/* For arrow */}
                                </Box>
                                {/* Data Rows */}
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'BigQuery' })}>
                                    <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><DatabaseIcon /></ListItemIcon> {/* Use theme color */}
                                        <Typography variant="body2">BigQuery</Typography>
                                    </Box>
                                    <Box sx={{ width: '20%' }}><Typography variant="body2">Connected</Typography></Box>
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30, color: theme.palette.status.connected }}><WifiIcon fontSize="small" /></ListItemIcon>
                                         <Typography variant="body2" color={theme.palette.status.connected}>Connected</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">Postgres</Typography></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'Postgres' })}>
                                     <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><DatabaseIcon /></ListItemIcon>
                                        <Typography variant="body2">Postgres</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">Not connected</Typography></Box>
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30, color: theme.palette.status.notConnected }}><WifiOffIcon fontSize="small" /></ListItemIcon>
                                         <Typography variant="body2" color={theme.palette.status.notConnected}>Not connected</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">5432</Typography></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'MySQL' })}>
                                     <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><DatabaseIcon /></ListItemIcon>
                                        <Typography variant="body2">MySQL</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">Not connected</Typography></Box>
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30, color: theme.palette.status.notConnected }}><WifiOffIcon fontSize="small" /></ListItemIcon>
                                         <Typography variant="body2" color={theme.palette.status.notConnected}>Not connected</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">sales_db</Typography></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'SQL Server' })}>
                                     <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><DatabaseIcon /></ListItemIcon>
                                        <Typography variant="body2">SQL Server</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">Not connected</Typography></Box>
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30, color: theme.palette.status.notConnected }}><WifiOffIcon fontSize="small" /></ListItemIcon>
                                         <Typography variant="body2" color={theme.palette.status.notConnected}>Not connected</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">public</Typography></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'Redshift' })}>
                                     <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><DatabaseIcon /></ListItemIcon>
                                        <Typography variant="body2">Redshift</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">Saliented</Typography></Box>
                                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30, color: theme.palette.status.saliented }}><ErrorOutlineIcon fontSize="small" /></ListItemIcon> {/* Using ErrorOutline for Saliented as a placeholder */}
                                         <Typography variant="body2" color={theme.palette.status.saliented}>Saliented</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}><Typography variant="body2">admin</Typography></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, cursor: 'pointer' }} onClick={() => handleListItemClick({ name: 'Other Database' })}>
                                    <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                                        <ListItemIcon sx={{ minWidth: 30, color: theme.palette.primary.main }}><OtherHousesIcon /></ListItemIcon>
                                        <Typography variant="body2">Other Database</Typography>
                                    </Box>
                                     <Box sx={{ width: '20%' }}></Box> {/* Empty cells for alignment */}
                                     <Box sx={{ width: '20%' }}></Box>
                                     <Box sx={{ width: '20%' }}></Box>
                                    <Box sx={{ width: '10%', textAlign: 'right', color: theme.palette.text.secondary }}><ArrowRightIcon fontSize="small"/></Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Add Connection Card */}
                    {/* Using Grid item to control width within the flex container */}
                     <Grid item xs={12} sm={6} md={7} lg={6.5} // Adjust breakpoint widths - wider than Data Sources
                           sx={{ flexGrow: 1, flexBasis: 'min(500px, 100%)' }} // Use flexBasis for preferred width
                     >
                        <Paper sx={{ p: 2, position: 'relative', height: '100%' }}>
                            <IconButton aria-label="close" sx={{ position: 'absolute', top: 8, right: 8 }}
                                        onClick={() => handleCloseCard('Add Connection')}>
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" mb={2}>Add Connection</Typography>
                            <TextField fullWidth label="Connection Name" variant="outlined" margin="normal" size="small"/> {/* Use size="small" for compact forms */}
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel id="database-type-label">Database Type</InputLabel>
                                <Select
                                    labelId="database-type-label"
                                    id="database-type"
                                    value=""
                                    label="Database Type"
                                >
                                    <MenuItem value="">Postgres</MenuItem>
                                    {/* Add other options */}
                                </Select>
                            </FormControl>
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Sort" variant="outlined" value="5432" size="small"/>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="5432" variant="outlined" size="small"/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Host" variant="outlined" value="db.example.com" size="small"/>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Database" variant="outlined" value="sales_db" size="small"/>
                                </Grid>
                            </Grid>
                            <TextField fullWidth label="Username" variant="outlined" margin="normal" value="admin" size="small"/>
                            <TextField fullWidth label="Password" type="password" variant="outlined" margin="normal" value="********" size="small"/>
                            <TextField fullWidth label="Description" multiline rows={2} variant="outlined" margin="normal" size="small"/>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button variant="outlined" size="small" onClick={() => handleButtonClick('Cancel Add Connection')}>Cancel</Button>
                                <Button variant="contained" size="small" onClick={() => handleButtonClick('Test Connection')}>Test Connection</Button>
                                <Button variant="contained" size="small" onClick={() => handleButtonClick('Create Connection')}>Create</Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Schema Profiling Card */}
                     {/* Using Grid item to control width within the flex container - similar width to Add Connection */}
                     <Grid item xs={12} sm={6} md={7} lg={6.5}
                           sx={{ flexGrow: 1, flexBasis: 'min(500px, 100%)' }} // Use flexBasis for preferred width
                     >
                        <Paper sx={{ p: 2, position: 'relative', height: '100%' }}>
                            <IconButton aria-label="close" sx={{ position: 'absolute', top: 8, right: 8 }}
                                        onClick={() => handleCloseCard('Schema Profiling')}>
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" mb={2}>Schema Profiling</Typography>
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel id="database-connection-label">Database Connection</InputLabel>
                                <Select
                                    labelId="database-connection-label"
                                    id="database-connection"
                                    value="sales_db"
                                    label="Database Connection"
                                >
                                    <MenuItem value="sales_db">Sales DB</MenuItem>
                                    {/* Add other options */}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel id="schema-label">Schema</InputLabel>
                                <Select
                                    labelId="schema-label"
                                    id="schema"
                                    value="public"
                                    label="Schema"
                                >
                                    <MenuItem value="public">public</MenuItem>
                                    {/* Add other options */}
                                </Select>
                            </FormControl>
                             {/* Custom layout for schema/table list */}
                             <Box sx={{ mt: 2 }}>
                                 {/* Header */}
                                 <Box sx={{ display: 'flex', borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5, mb: 0.5, color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                                     <Box sx={{ width: '50%', pl: 3 }}>Table Name</Box> {/* Padding to align with icons */}
                                     <Box sx={{ width: '50%' }}>Columns</Box>
                                 </Box>
                                 {/* Items */}
                                 <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleTableItemClick({ table: 'customers' })}>
                                     <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30 }}><ExpandMoreIcon fontSize="small"/></ListItemIcon>
                                         <Typography variant="body2">customers</Typography>
                                     </Box>
                                     <Box sx={{ width: '50%' }}><Typography variant="body2">id, name, email</Typography></Box> {/* Placeholder columns */}
                                 </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleTableItemClick({ table: 'orders' })}>
                                     <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30 }}><ExpandMoreIcon fontSize="small"/></ListItemIcon>
                                         <Typography variant="body2">orders</Typography>
                                     </Box>
                                     <Box sx={{ width: '50%' }}><Typography variant="body2">id, customer_id, order_date</Typography></Box> {/* Placeholder columns */}
                                 </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }} onClick={() => handleTableItemClick({ table: 'order_items' })}>
                                     <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30 }}><ExpandMoreIcon fontSize="small"/></ListItemIcon>
                                         <Typography variant="body2">order_items</Typography>
                                     </Box>
                                     <Box sx={{ width: '50%' }}><Typography variant="body2">order_id, product_id, quantity</Typography></Box> {/* Placeholder columns */}
                                 </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, cursor: 'pointer' }} onClick={() => handleTableItemClick({ table: 'products' })}>
                                     <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                         <ListItemIcon sx={{ minWidth: 30 }}><ChevronRightIcon fontSize="small"/></ListItemIcon>
                                         <Typography variant="body2">products</Typography>
                                     </Box>
                                     <Box sx={{ width: '50%' }}><Typography variant="body2">id, name, price</Typography></Box> {/* Placeholder columns */}
                                 </Box>
                             </Box>

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button variant="outlined" size="small" onClick={() => handleButtonClick('Cancel Schema Profiling')}>Cancel</Button>
                                <Button variant="contained" size="small" onClick={() => handleButtonClick('Test Connection (Profiling)')}>Test Connection</Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Test Cases Card */}
                    {/* Using Grid item to control width within the flex container - similar width to Data Sources */}
                     <Grid item xs={12} sm={6} md={5} lg={4.5}
                           sx={{ flexGrow: 1, flexBasis: 'min(400px, 100%)' }} // Use flexBasis for preferred width
                     >
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Test Cases</Typography>
                                <Button variant="contained" startIcon={<AddIcon />} size="small"
                                        onClick={() => handleButtonClick('Add Test Case')}
                                >
                                    Add Test Case
                                </Button>
                            </Box>
                            <List dense>
                                {/* Test Case Items */}
                                <ListItem sx={{ cursor: 'pointer' }} onClick={() => handleListItemClick({ testCase: 'order_items.id Not null' })}>
                                    <ListItemIcon sx={{ minWidth: 30 }}><CheckCircleOutlineIcon color="success" fontSize="small"/></ListItemIcon> {/* Use theme status color? */}
                                    <ListItemText
                                        primary={<Typography variant="body2">order_items.id Not null</Typography>}
                                        secondary={<Typography variant="caption" color="textSecondary">Table: Sales DB</Typography>}
                                    />
                                    <ListItemIcon sx={{ ml: 'auto' }}><ArrowRightIcon fontSize="small"/></ListItemIcon>
                                </ListItem>
                                <ListItem sx={{ cursor: 'pointer' }} onClick={() => handleListItemClick({ testCase: 'orders.customer_id Foreign key' })}>
                                    <ListItemIcon sx={{ minWidth: 30 }}><CheckCircleOutlineIcon color="success" fontSize="small"/></ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="body2">orders.customer_id Foreign key</Typography>}
                                        secondary={<Typography variant="caption" color="textSecondary">Table: public</Typography>}
                                    />
                                    <ListItemIcon sx={{ ml: 'auto' }}><ArrowRightIcon fontSize="small"/></ListItemIcon>
                                </ListItem>
                                <ListItem sx={{ cursor: 'pointer' }} onClick={() => handleListItemClick({ testCase: 'orders.status Expected values' })}>
                                    <ListItemIcon sx={{ minWidth: 30 }}><CheckCircleOutlineIcon color="success" fontSize="small"/></ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="body2">orders.status Expected values</Typography>}
                                        secondary={<Typography variant="caption" color="textSecondary">Table: products</Typography>}
                                    />
                                    <ListItemIcon sx={{ ml: 'auto' }}><ArrowRightIcon fontSize="small"/></ListItemIcon>
                                </ListItem>
                                <ListItem sx={{ cursor: 'pointer' }} onClick={() => handleListItemClick({ testCase: 'products.id Uniqueness' })}>
                                    <ListItemIcon sx={{ minWidth: 30 }}><CheckCircleOutlineIcon color="success" fontSize="small"/></ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="body2">products.id Uniqueness</Typography>}
                                        secondary={<Typography variant="caption" color="textSecondary">Table: products</Typography>}
                                    />
                                    <ListItemIcon sx={{ ml: 'auto' }}><ArrowRightIcon fontSize="small"/></ListItemIcon>
                                </ListItem>
                                {/* Add more test cases */}
                            </List>
                        </Paper>
                    </Grid>

                </Box> {/* End of main Flexbox container */}
            </Box>
        </ThemeProvider>
    );
};

export default HomepageLayout;