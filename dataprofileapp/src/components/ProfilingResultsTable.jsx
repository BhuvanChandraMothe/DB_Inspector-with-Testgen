import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, LinearProgress, Chip, Dialog, DialogTitle, DialogContent, IconButton, Divider, Box, List, ListItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const getPercentage = (value, total) => total ? ((value / total) * 100).toFixed(1) : 0;

const ProfilingResultsTable = ({ profilingData }) => {
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = (col) => {
    setSelectedColumn(col);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedColumn(null);
    setDialogOpen(false);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography fontWeight="bold">Column</Typography></TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Gen. Type</TableCell>
              <TableCell>Nulls</TableCell>
              <TableCell>Distinct</TableCell>
              <TableCell>PII</TableCell>
              <TableCell>Suggestion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profilingData.map((col) => (
              <TableRow key={col.id} hover onClick={() => openDialog(col)} sx={{ cursor: 'pointer' }}>
                <TableCell>{col.column_name}</TableCell>
                <TableCell>{col.column_type}</TableCell>
                <TableCell>{col.general_type}</TableCell>
                <TableCell>
                  {col.null_value_ct} ({getPercentage(col.null_value_ct, col.record_ct)}%)
                  <LinearProgress
                    variant="determinate"
                    value={getPercentage(col.null_value_ct, col.record_ct)}
                    color="error"
                  />
                </TableCell>
                <TableCell>
                  {col.distinct_value_ct} ({getPercentage(col.distinct_value_ct, col.value_ct)}%)
                  <LinearProgress
                    variant="determinate"
                    value={getPercentage(col.distinct_value_ct, col.value_ct)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  {col.pii_flag ? (
                    <Chip label="PII" color="warning" size="small" />
                  ) : (
                    <Chip label="No" size="small" />
                  )}
                </TableCell>
                <TableCell>{col.datatype_suggestion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detailed Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'background.default' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedColumn?.column_name} - Detailed Profile</Typography>
            <IconButton onClick={closeDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
          {selectedColumn && (
            <>
              {/* Overview */}
              <Typography variant="subtitle1" gutterBottom>Overview</Typography>
              <Divider />
              <Box my={1}>
                <Typography><b>Table:</b> {selectedColumn.table_name}</Typography>
                <Typography><b>Schema:</b> {selectedColumn.schema_name}</Typography>
                <Typography><b>Run Date:</b> {new Date(selectedColumn.run_date).toLocaleString()}</Typography>
                <Typography><b>Column Type:</b> {selectedColumn.column_type}</Typography>
                <Typography><b>General Type:</b> {selectedColumn.general_type}</Typography>
                <Typography><b>Datatype Suggestion:</b> {selectedColumn.datatype_suggestion}</Typography>
                <Typography><b>PII Flag:</b> {selectedColumn.pii_flag ? 'Yes' : 'No'}</Typography>
                <Typography><b>Functional Type:</b> {selectedColumn.functional_data_type} / {selectedColumn.functional_table_type}</Typography>
              </Box>

              {/* Completeness */}
              <Typography variant="subtitle1" gutterBottom>Completeness</Typography>
              <Divider />
              <Box my={1}>
                <Typography>Record Count: {selectedColumn.record_ct}</Typography>
                <Typography>Value Count: {selectedColumn.value_ct}</Typography>
                <Typography>Null Count: {selectedColumn.null_value_ct}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={getPercentage(selectedColumn.value_ct, selectedColumn.record_ct)}
                  sx={{ mb: 1 }}
                />
              </Box>

              {/* Uniqueness */}
              <Typography variant="subtitle1" gutterBottom>Uniqueness</Typography>
              <Divider />
              <Box my={1}>
                <Typography>Distinct Values: {selectedColumn.distinct_value_ct}</Typography>
                <Typography>Standard Distinct: {selectedColumn.distinct_std_value_ct}</Typography>
                <Typography>Hash: {selectedColumn.distinct_value_hash}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={getPercentage(selectedColumn.distinct_value_ct, selectedColumn.value_ct)}
                  color="secondary"
                />
              </Box>

              {/* Conditional Sections */}
              {['T', 'O'].includes(selectedColumn.general_type) && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Text Characteristics</Typography>
                  <Divider />
                  <Box my={1}>
                    <Typography>Min Length: {selectedColumn.min_length}</Typography>
                    <Typography>Max Length: {selectedColumn.max_length}</Typography>
                    <Typography>Avg Length: {selectedColumn.avg_length}</Typography>
                    <Typography>Upper Case Count: {selectedColumn.upper_case_ct}</Typography>
                    <Typography>Lower Case Count: {selectedColumn.lower_case_ct}</Typography>
                    {selectedColumn.top_freq_values && (
                      <>
                        <Typography>Top Values:</Typography>
                        <List dense>
                          {selectedColumn.top_freq_values.map((val, i) => (
                            <ListItem key={i}>{val}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                </>
              )}

              {selectedColumn.general_type === 'N' && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Numeric Stats</Typography>
                  <Divider />
                  <Box my={1}>
                    <Typography>Min: {selectedColumn.min_value}</Typography>
                    <Typography>Max: {selectedColumn.max_value}</Typography>
                    <Typography>Avg: {selectedColumn.avg_value}</Typography>
                    <Typography>Stdev: {selectedColumn.stdev_value}</Typography>
                  </Box>
                </>
              )}

              {selectedColumn.general_type === 'D' && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Date Stats</Typography>
                  <Divider />
                  <Box my={1}>
                    <Typography>Min Date: {selectedColumn.min_date}</Typography>
                    <Typography>Max Date: {selectedColumn.max_date}</Typography>
                    <Typography>Within 1yr: {selectedColumn.within_1yr_date_ct}</Typography>
                    <Typography>Before 5yr: {selectedColumn.before_5yr_date_ct}</Typography>
                  </Box>
                </>
              )}

              {selectedColumn.general_type === 'B' && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Boolean Stats</Typography>
                  <Divider />
                  <Box my={1}>
                    <Typography>True Count: {selectedColumn.boolean_true_ct}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getPercentage(selectedColumn.boolean_true_ct, selectedColumn.value_ct)}
                      color="info"
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilingResultsTable;
