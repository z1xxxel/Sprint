package com.sprint.tms_backend.DTO;

import java.time.LocalDateTime;
import java.util.List;

public record SeasonInfoDTO(
        Long id,
        String name,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Boolean isActive,

        List<LeaderboardEntryDTO> currentLeaderboard,
        List<SeasonResultDTO> previousSeasonResults,

        String myDepartmentName,
        Integer myDepartmentPlace,
        List<LeaderboardEntryDTO> myDepartmentLeaderboard,
        List<DepartmentResultDTO> previousDepartmentResults
) {}