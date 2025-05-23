import React, { useState } from "react";
import { Credits } from "../../../models/movie-detail.model";
import {
  Box,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import theme from "../../theme";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { AppTextField } from "./AppTextField";

interface MovieCastAndCrewProps {
  credits: Credits;
}

interface PersonListItemProps {
  id: number;
  index: number;
  name: string;
  profilePath: string | null;
  description: string;
}

const PersonListItem: React.FC<PersonListItemProps> = ({
  id,
  index,
  name,
  profilePath,
  description,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const listItemTextStyles = {
    marginLeft: 2,
    "& .MuiListItemText-primary": {
      color: theme.customVariables.appWhiteSmoke,
    },
    "& .MuiListItemText-secondary": {
      color: theme.customVariables.appWhiteSmoke,
    },
  };

  return (
    <ListItem key={`${id}-${index}`}>
      <ListItemAvatar>
        <Avatar
          sx={{ width: 65, height: 65 }}
          src={profilePath ? getTmdbImageUrl(profilePath) : undefined}
          alt={name}
        />
      </ListItemAvatar>
      <ListItemText
        sx={listItemTextStyles}
        primary={name}
        secondary={description}
      />
    </ListItem>
  );
};

export const MovieCastAndCrew: React.FC<MovieCastAndCrewProps> = ({
  credits,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filterPersons = (
    persons: Array<{
      id: number;
      name: string;
      profile_path: string | null;
      description: string;
    }>,
  ) => {
    return persons.filter(
      (person) =>
        person.name.toLowerCase().includes(searchQuery) ||
        person.description.toLowerCase().includes(searchQuery),
    );
  };

  const castMembers = credits.cast.map((castMember) => ({
    id: castMember.id,
    name: castMember.name,
    profile_path: castMember.profile_path,
    description: `Character: ${castMember.character}`,
  }));

  const crewMembers = credits.crew.map((crewMember) => ({
    id: crewMember.id,
    name: crewMember.name,
    profile_path: crewMember.profile_path,
    description: `Job: ${crewMember.job}`,
  }));

  const renderPersonList = (
    persons: Array<{
      id: number;
      name: string;
      profile_path: string | null;
      description: string;
    }>,
  ) => (
    <List>
      {persons.map((person, index) => (
        <PersonListItem
          key={`${person.id}-${index}`}
          id={person.id}
          index={index}
          name={person.name}
          profilePath={person.profile_path}
          description={person.description}
        />
      ))}
    </List>
  );

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab
          label="Cast"
          sx={{
            "&:not(.Mui-selected)": { color: "gray" },
            "&.Mui-selected": { color: theme.customVariables.appWhiteSmoke },
          }}
        />
        <Tab
          label="Crew"
          sx={{
            "&:not(.Mui-selected)": { color: "gray" },
            "&.Mui-selected": { color: theme.customVariables.appWhiteSmoke },
          }}
        />
      </Tabs>
      <Box p={2}>
        {tabValue === 0 && (
          <>
            <AppTextField
              label="Search cast by name or character"
              value={searchQuery}
              onChange={handleSearchChange}
              theme={theme}
            />
            {renderPersonList(filterPersons(castMembers))}
          </>
        )}
        {tabValue === 1 && renderPersonList(crewMembers)}
      </Box>
    </Box>
  );
};
