import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControlLabel, Checkbox, Grid, Box,
    Typography
} from '@mui/material';
import { createTableGroup } from '../api/dbapi';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'; // Import theme components if not provided by parent

// Define initial state based on TableGroupCreate Pydantic model fields and defaults
const initialFormValues = {
    table_group_name: '',
    table_group_schema: '',
    explicit_table_list: '',
    profiling_include_mask: '%',
    profiling_exclude_mask: 'tmp%',
    profile_id_column_mask: '%id',
    profile_sk_column_mask: '%_sk',
    profile_use_sampling: 'N',
    profile_sample_percent: '30',
    profile_sample_min_count: 100000,
    min_profiling_age_days: 0,
    profile_flag_cdes: true,
    profile_do_pair_rules: 'N',
    profile_pair_rule_pct: 95,
    description: '',
    data_source: '',
    source_system: '',
    source_process: '',
    data_location: '',
    business_domain: '',
    stakeholder_group: '',
    transform_level: '',
    data_product: '',
};

// Assuming dark theme is provided by a parent component.
// If not, you would need to define or import it here:
// const darkTheme = createTheme({ ... });

const AddTableGroupModal = ({ open, onClose, connectionId }) => {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (open) {
            setFormValues(initialFormValues);
            setError(null);
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAdd = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            console.log("Attempting to create table group for connectionId:", connectionId);

            const payload = {
                table_group_name: formValues.table_group_name,
                table_group_schema: formValues.table_group_schema || null,
                explicit_table_list: [],
                profiling_include_mask: formValues.profiling_include_mask || null,
                profiling_exclude_mask: formValues.profiling_exclude_mask || null,
                profile_id_column_mask: formValues.profile_id_column_mask || '%id',
                profile_sk_column_mask: formValues.profile_sk_column_mask || '%_sk',
                profile_use_sampling: formValues.profile_use_sampling === 'Y', // Send boolean
                profile_sample_percent: formValues.profile_sample_percent || '30',
                profile_sample_min_count: parseInt(formValues.profile_sample_min_count, 10) || 100000,
                min_profiling_age_days: formValues.min_profiling_age_days !== null && formValues.min_profiling_age_days !== '' ? parseInt(formValues.min_profiling_age_days, 10) : 0, // Send integer
                profile_flag_cdes: formValues.profile_flag_cdes,
                profile_do_pair_rules: formValues.profile_do_pair_rules === 'Y', // Send boolean
                profile_pair_rule_pct: parseInt(formValues.profile_pair_rule_pct, 10) || 95,
                description: formValues.description || null,
                data_source: formValues.data_source || null,
                source_system: formValues.source_system || null,
                source_process: formValues.source_process || null,
                data_location: formValues.data_location || null,
                business_domain: formValues.business_domain || null,
                stakeholder_group: formValues.stakeholder_group || null,
                transform_level: formValues.transform_level || null,
                data_product: formValues.data_product || null,
            };

            console.log("Payload for createTableGroup:", payload);

            await createTableGroup(connectionId, payload);

            onClose();
        } catch (error) {
            console.error('Error creating table group:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to create table group.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // ThemeProvider is likely provided by a parent component.
        // <ThemeProvider theme={darkTheme}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    Add Table Group
                </DialogTitle>

                {/* Added sx prop to DialogContent for background color */}
                <DialogContent dividers sx={(theme) => ({
                    pt: 3,
                    backgroundColor: theme.palette.background.paper, // Apply paper background color
                    color: theme.palette.text.primary, // Ensure text color is readable
                })}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Table Group Name"
                                name="table_group_name"
                                value={formValues.table_group_name}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="DB Schema"
                                name="table_group_schema"
                                value={formValues.table_group_schema}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Profiling Include Mask"
                                name="profiling_include_mask"
                                value={formValues.profiling_include_mask}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Profiling Exclude Mask"
                                name="profiling_exclude_mask"
                                value={formValues.profiling_exclude_mask}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Profile ID Column Mask"
                                name="profile_id_column_mask"
                                value={formValues.profile_id_column_mask}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Profile SK Column Mask"
                                name="profile_sk_column_mask"
                                value={formValues.profile_sk_column_mask}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Min Profiling Age (Days)"
                                type="number"
                                name="min_profiling_age_days"
                                value={formValues.min_profiling_age_days}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                             <TextField
                                 label="Profile Sample Percent (%)"
                                 type="number"
                                 name="profile_sample_percent"
                                 value={formValues.profile_sample_percent}
                                 onChange={handleChange}
                                 fullWidth
                                 size="small"
                                 inputProps={{ min: 0, max: 100 }}
                             />
                         </Grid>
                         <Grid item xs={12} md={6}>
                              <TextField
                                  label="Profile Sample Min Count"
                                  type="number"
                                  name="profile_sample_min_count"
                                  value={formValues.profile_sample_min_count}
                                  onChange={handleChange}
                                  fullWidth
                                  size="small"
                                  inputProps={{ min: 0 }}
                              />
                          </Grid>
                         <Grid item xs={12} md={6}>
                              <TextField
                                  label="Description"
                                  name="description"
                                  value={formValues.description}
                                  onChange={handleChange}
                                  fullWidth
                                  size="small"
                                  multiline
                                  rows={2}
                              />
                          </Grid>
                          <Grid item xs={12} md={6}>
                               <TextField
                                   label="Data Source"
                                   name="data_source"
                                   value={formValues.data_source}
                                   onChange={handleChange}
                                   fullWidth
                                   size="small"
                               />
                           </Grid>
                           <Grid item xs={12} md={6}>
                                <TextField
                                    label="Source System"
                                    name="source_system"
                                    value={formValues.source_system}
                                    onChange={handleChange}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                 <TextField
                                     label="Source Process"
                                     name="source_process"
                                     value={formValues.source_process}
                                     onChange={handleChange}
                                     fullWidth
                                     size="small"
                                 />
                             </Grid>
                             <Grid item xs={12} md={6}>
                                  <TextField
                                      label="Data Location"
                                      name="data_location"
                                      value={formValues.data_location}
                                      onChange={handleChange}
                                      fullWidth
                                      size="small"
                                  />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                   <TextField
                                       label="Business Domain"
                                       name="business_domain"
                                       value={formValues.business_domain}
                                       onChange={handleChange}
                                       fullWidth
                                       size="small"
                                   />
                               </Grid>
                               <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Stakeholder Group"
                                        name="stakeholder_group"
                                        value={formValues.stakeholder_group}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                     <TextField
                                         label="Transform Level"
                                         name="transform_level"
                                         value={formValues.transform_level}
                                         onChange={handleChange}
                                         fullWidth
                                         size="small"
                                     />
                                 </Grid>
                                 <Grid item xs={12} md={6}>
                                      <TextField
                                          label="Data Product"
                                          name="data_product"
                                          value={formValues.data_product}
                                          onChange={handleChange}
                                          fullWidth
                                          size="small"
                                      />
                                  </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formValues.profile_flag_cdes}
                                            onChange={handleChange}
                                            name="profile_flag_cdes"
                                        />
                                    }
                                    label="Profile Flag CDEs"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formValues.profile_use_sampling === 'Y'}
                                            onChange={(e) => handleChange({
                                                target: {
                                                    name: 'profile_use_sampling',
                                                    value: e.target.checked ? 'Y' : 'N',
                                                    type: 'text'
                                                }
                                            })}
                                            name="profile_use_sampling"
                                        />
                                    }
                                    label="Use Profile Sampling"
                                />
                                 <FormControlLabel
                                     control={
                                         <Checkbox
                                             checked={formValues.profile_do_pair_rules === 'Y'}
                                             onChange={(e) => handleChange({
                                                 target: {
                                                     name: 'profile_do_pair_rules',
                                                     value: e.target.checked ? 'Y' : 'N',
                                                     type: 'text'
                                                 }
                                             })}
                                             name="profile_do_pair_rules"
                                         />
                                     }
                                     label="Profile Do Pair Rules"
                                 />
                                 <FormControlLabel
                                     control={
                                         <Checkbox
                                             checked={formValues.scorecard}
                                             onChange={handleChange}
                                             name="scorecard"
                                         />
                                     }
                                     label="Add Scorecard for Table Group"
                                 />
                            </Box>
                        </Grid>
                    </Grid>

                    {error && (
                        <Box mt={2} p={2} bgcolor="error.dark" color="white" borderRadius={1}>
                            <Typography>{error}</Typography>
                        </Box>
                    )}

                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="secondary" variant="outlined" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Table Group'}
                    </Button>
                </DialogActions>
            </Dialog>
        // </ThemeProvider>
    );
};

export default AddTableGroupModal;
