package com.cloudcomputing.backend.devices;

import java.time.Clock;
import java.util.UUID;

import com.cloudcomputing.backend.credentials.DeviceCredential;
import com.cloudcomputing.backend.credentials.DeviceCredentialRepository;
import com.cloudcomputing.backend.errors.exceptions.InvalidDeviceTokenException;
import com.cloudcomputing.backend.invitations.InvitationService;
import com.cloudcomputing.backend.security.TokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class DeviceService {
    private final DeviceRepository devices;
    private final DeviceCredentialRepository credentials;
    private final InvitationService invitations;
    private final TokenService tokens;
    private final Clock clock;
    private final TransactionTemplate transactions;

    // Share dependencies and one explicit transaction for the registration operation.
    public DeviceService(DeviceRepository devices, DeviceCredentialRepository credentials,
            InvitationService invitations, TokenService tokens, Clock clock,
            PlatformTransactionManager transactionManager) {
        this.devices = devices;
        this.credentials = credentials;
        this.invitations = invitations;
        this.tokens = tokens;
        this.clock = clock;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    // Save the device, credential, and invitation consumption together or roll everything back.
    public RegisterDeviceResponse registerDevice(RegisterDeviceRequest request) {
        return transactions.execute(status -> {
            UUID groupId = invitations.consumeInvitation(request.invitationToken());
            var registeredAt = clock.instant();
            // Assign identity during enrollment so a new agent only needs its invitation and name.
            var device = new Device(UUID.randomUUID(), groupId, request.displayName().strip(),
                    request.deviceType(), registeredAt, null);
            devices.insert(device);

            String deviceToken = tokens.generateToken();
            credentials.insert(new DeviceCredential(UUID.randomUUID(), device.id(),
                    tokens.hashToken(deviceToken), registeredAt, null));
            return new RegisterDeviceResponse(device.id(), groupId, deviceToken);
        });
    }

    // Authenticate the caller by device token and list only the members of its own group.
    public GroupDevicesResponse listGroupDevices(String authorization) {
        String prefix = "Bearer ";
        if (authorization == null || !authorization.startsWith(prefix)) {
            throw new InvalidDeviceTokenException();
        }
        String token = authorization.substring(prefix.length());
        if (!token.matches("[A-Za-z0-9_-]{43}")) {
            throw new InvalidDeviceTokenException();
        }

        Device caller = devices.findActiveByTokenHash(tokens.hashToken(token))
                .orElseThrow(InvalidDeviceTokenException::new);
        var members = devices.findActiveByGroupId(caller.groupId()).stream()
                .map(device -> new DeviceSummary(device.id(), device.displayName(),
                        device.deviceType(), device.registeredAt()))
                .toList();
        return new GroupDevicesResponse(caller.id(), members);
    }
}
